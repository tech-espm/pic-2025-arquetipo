import app = require("teem");
import Perfil = require("../enums/perfil");

interface Arquetipo {
	id: number;
	nome: string;
	nomeexterno: string;
	descricaocurta: string;
	descricaocompleta: string;
	excluir_imagem_atual?: number | null;

	//usado apenas no obter
	iddepartamento: number[] | string | null;
}

class Arquetipo {
	private static validar(arquetipo: Arquetipo, criacao: boolean): string {
		if (!arquetipo)
			return "Arquetipo inválido";

		arquetipo.id = parseInt(arquetipo.id as any);

		if (!criacao) {
			if (isNaN(arquetipo.id))
				return "Id inválido";
		}

		if (!arquetipo.nome || !(arquetipo.nome = arquetipo.nome.normalize().trim()) || arquetipo.nome.length > 100)
			return "Nome inválido";

		if (!arquetipo.nomeexterno || !(arquetipo.nomeexterno = arquetipo.nomeexterno.normalize().trim()) || arquetipo.nomeexterno.length > 100)
			return "Nome externo inválido";


		if (!arquetipo.descricaocurta || !(arquetipo.descricaocurta = arquetipo.descricaocurta.normalize()) || arquetipo.descricaocurta.length > 255)
			return "Descrição curta inválida";


		if (!arquetipo.descricaocompleta || !(arquetipo.descricaocompleta = arquetipo.descricaocompleta.normalize()) || arquetipo.descricaocompleta.length > 1000)
			return "Descrição completa inválida";

		if (!arquetipo.iddepartamento || !arquetipo.iddepartamento.length) {
			arquetipo.iddepartamento = null;
		} else {
			arquetipo.iddepartamento = (arquetipo.iddepartamento as string).split(",").map(Number) as number[];
			for (let i = 0; i < arquetipo.iddepartamento.length; i++) {
				if (!arquetipo.iddepartamento[i])
					return "Departamento inválido";
			}
		}

		return null;
	}

	public static listar(idusuario: number, idperfil: Perfil): Promise<Arquetipo[]> {
		return app.sql.connect(async (sql) => {
			if (idperfil == Perfil.Administrador)
				return (await sql.query("select a.id, a.nome, a.nomeexterno, a.descricaocurta, (select group_concat(d.nome order by d.nome asc separator ', ') from arquetipo_departamento ad inner join departamento d on d.id = ad.iddepartamento where ad.idarquetipo = a.id) departamentos from arquetipo a")) || [];

			return (await sql.query(`select tmp.id, a.nome, a.nomeexterno, a.descricaocurta,
			(select group_concat(d.nome order by d.nome asc separator ', ') from arquetipo_departamento ad inner join departamento d on d.id = ad.iddepartamento where ad.idarquetipo = tmp.id) departamentos
			from (
				select distinct ad.idarquetipo id
				from usuario_departamento ud
				inner join arquetipo_departamento ad on ad.iddepartamento = ud.iddepartamento
				where ud.idusuario = ?
			) tmp
			inner join arquetipo a on a.id = tmp.id
			`, [idusuario])) || [];
		});
	}

	public static listarCombo(idusuario: number, idperfil: Perfil): Promise<Arquetipo[]> {
		return app.sql.connect(async (sql) => {
			if (idperfil == Perfil.Administrador)
				return (await sql.query("select id, nome from arquetipo order by nome asc")) || [];

			return (await sql.query(`select tmp.id, a.nome from (
				select distinct ad.idarquetipo id
				from usuario_departamento ud
				inner join arquetipo_departamento ad on ad.iddepartamento = ud.iddepartamento
				where ud.idusuario = ?
			) tmp
			inner join arquetipo a on a.id = tmp.id
			order by a.nome asc
			`, [idusuario])) || [];
		});
	}

	public static obter(id: number, idusuario: number, idperfil: Perfil): Promise<Arquetipo | null> {
		return app.sql.connect(async (sql) => {
			const lista: Arquetipo[] = await sql.query("select id, nome, nomeexterno, versao, descricaocurta, descricaocompleta from arquetipo where id = ?", [id]);
			if (!lista || !lista[0])
				return null;

			lista[0].iddepartamento = (await sql.query(`SELECT iddepartamento FROM arquetipo_departamento WHERE idarquetipo = ?`, [id]) as any[]).map(d => d.iddepartamento);

			if (idperfil === Perfil.Administrador) {
				return lista[0];
			} else {
				const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);
				if (usuarioDepartamentos.some(iddepartamento => (lista[0].iddepartamento as number[]).includes(iddepartamento)))
					return lista[0];
			}

			return null;
		});
	}

	private static async merge(sql: app.Sql, id: number, departamentos: number[] | null) {
		if (!departamentos)
			departamentos = [];

		const existentes: { id: number, iddepartamento: number }[] = await sql.query(`SELECT id, iddepartamento FROM arquetipo_departamento WHERE idarquetipo = ?`, [id]);
		const toRemove = existentes.filter(e => !(departamentos as number[]).includes(e.iddepartamento));
		const toAdd = departamentos.filter(n => !existentes.some(e => e.iddepartamento === n));
		const toUpdate: typeof existentes = [];

		while (toRemove.length && toAdd.length) {
			const item = toRemove.pop() as typeof existentes[number];
			item.iddepartamento = toAdd.pop() as number;
			toUpdate.push(item);
		}

		for (let i = 0; i < toRemove.length; i++)
			await sql.query(`DELETE FROM arquetipo_departamento WHERE id = ?`, [toRemove[i].id]);

		for (let i = 0; i < toUpdate.length; i++)
			await sql.query(`UPDATE arquetipo_departamento SET iddepartamento = ? WHERE id = ?`, [toUpdate[i].iddepartamento, toUpdate[i].id]);

		for (let i = 0; i < toAdd.length; i++)
			await sql.query(`INSERT INTO arquetipo_departamento (idarquetipo, iddepartamento) VALUES (?, ?)`, [id, toAdd[i]]);
	};

	public static async criar(arquetipo: Arquetipo, idusuario: number, idperfil: Perfil, imagem?: app.UploadedFile | null): Promise<string | number> {
		const res = Arquetipo.validar(arquetipo, true);
		if (res)
			return res;

		if (imagem && imagem.size > 4 * 1024 * 1024)
			return "O tamanho da imagem não pode ser maior que 4MB";

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			if (idperfil !== Perfil.Administrador) {
				if (arquetipo.iddepartamento) {
					const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);
					if ((arquetipo.iddepartamento as number[]).some(iddepartamento => !usuarioDepartamentos.includes(iddepartamento)))
						return "Departamento não encontrado";
				}

				if (!arquetipo.iddepartamento || !arquetipo.iddepartamento.length)
					return "É necessário selecionar ao menos um departamento para criar o arquétipo";
			}

			try {
				await sql.query("insert into arquetipo (nome, nomeexterno, descricaocurta, descricaocompleta, versao) values (?, ?, ?, ?, ?)", [arquetipo.nome, arquetipo.nomeexterno, arquetipo.descricaocurta, arquetipo.descricaocompleta, imagem ? 1 : 0]);

				arquetipo.id = (await sql.scalar("select last_insert_id()")) as number;

				await Arquetipo.merge(sql, arquetipo.id, arquetipo.iddepartamento as number[]);

				if (imagem)
					await app.fileSystem.saveUploadedFile("public/img/arquetipo/" + arquetipo.id + ".jpg", imagem);

				await sql.commit();

				return arquetipo.id;
			} catch (e) {
				if (e.code === "ER_DUP_ENTRY" && typeof e.message === "string") {
					if (e.message.includes("nomeexterno")) {
						return `O nome externo ${arquetipo.nomeexterno} já está em uso`;
					}
					if (e.message.includes("nome")) {
						return `O nome ${arquetipo.nome} já está em uso`;
					}
					return "Já existe um registro com dados duplicados";
				}
				throw e;
			}
		});
	}

	public static async editar(arquetipo: Arquetipo, idusuario: number, idperfil: Perfil, imagem?: app.UploadedFile | null): Promise<string | number> {
		const res = Arquetipo.validar(arquetipo, false);
		if (res)
			return res;

		if (imagem) {
			arquetipo.excluir_imagem_atual = 0;

			if (imagem.size > 4 * 1024 * 1024)
				return "O tamanho da imagem não pode ser maior que 4MB";
		} else if (parseInt(arquetipo.excluir_imagem_atual as any)) {
			arquetipo.excluir_imagem_atual = 1;
		}

		return app.sql.connect(async (sql) => {
			try {
				if (idperfil !== Perfil.Administrador) {
					const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);

					if (arquetipo.iddepartamento) {
						if ((arquetipo.iddepartamento as number[]).some(iddepartamento => !usuarioDepartamentos.includes(iddepartamento)))
							return "Departamento não encontrado";
					}

					if (!arquetipo.iddepartamento || !arquetipo.iddepartamento.length)
						return "É necessário selecionar ao menos um departamento para editar o arquétipo";

					// Faz de conta que o usuário selecionou todos os departamentos aos quais ele não teria acesso,
					// para que o merge não cause impacto, excluindo os departamentos que ele não tem acesso.
					let existentes: number[] = (await sql.query(`SELECT iddepartamento FROM arquetipo_departamento WHERE idarquetipo = ?`, [arquetipo.id]) as any[]).map(d => d.iddepartamento);
					if (existentes.length) {
						if (!existentes.some(iddepartamento => usuarioDepartamentos.includes(iddepartamento)))
							return "Arquétipo não encontrado";

						existentes = existentes.filter(iddepartamento => !usuarioDepartamentos.includes(iddepartamento));
						if (!arquetipo.iddepartamento)
							arquetipo.iddepartamento = [];
						(arquetipo.iddepartamento as number[]).push(...existentes);
					} else {
						return "Arquétipo não encontrado";
					}
				}

				await sql.query("update arquetipo set nome = ?, nomeexterno = ?, descricaocurta = ?, descricaocompleta = ? where id = ?", [arquetipo.nome, arquetipo.nomeexterno, arquetipo.descricaocurta, arquetipo.descricaocompleta, arquetipo.id]);

				if (!sql.affectedRows)
					return "Arquétipo não encontrado";

				await Arquetipo.merge(sql, arquetipo.id, arquetipo.iddepartamento as number[]);

				let versao: number = await sql.scalar("select versao from arquetipo where id = ?", [arquetipo.id]);

				const caminhoImagem = "public/img/arquetipo/" + arquetipo.id + ".jpg";
				if (arquetipo.excluir_imagem_atual) {
					versao = -(Math.abs(versao) + 1);
					await sql.query("update arquetipo set versao = ? where id = ?", [versao, arquetipo.id]);

					if ((await app.fileSystem.exists(caminhoImagem)))
						await app.fileSystem.deleteFile(caminhoImagem);
				} else if (imagem) {
					versao = Math.abs(versao) + 1;
					await sql.query("update arquetipo set versao = ? where id = ?", [versao, arquetipo.id]);

					await app.fileSystem.saveUploadedFile(caminhoImagem, imagem);
				}

				await sql.commit();

				return versao;
			} catch (e) {
				if (e.code === "ER_DUP_ENTRY" && typeof e.message === "string") {
					if (e.message.includes("nomeexterno")) {
						return `O nome externo ${arquetipo.nomeexterno} já está em uso`;
					}
					if (e.message.includes("nome")) {
						return `O nome ${arquetipo.nome} já está em uso`;
					}
					return "Já existe um registro com dados duplicados";
				}
				throw e;
			}

		});
	}

	public static async excluir(id: number, idusuario: number, idperfil: Perfil): Promise<string | null> {
		return app.sql.connect(async (sql) => {
			try {
				if (idperfil !== Perfil.Administrador) {
					const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);

					const existentes: number[] = (await sql.query(`SELECT iddepartamento FROM arquetipo_departamento WHERE idarquetipo = ?`, [id]) as any[]).map(d => d.iddepartamento);
					if (existentes.length) {
						if (!existentes.some(iddepartamento => usuarioDepartamentos.includes(iddepartamento)))
							return "Arquétipo não encontrado";
					} else {
						return "Arquétipo não encontrado";
					}
				}

				await sql.query("delete from arquetipo where id = ?", [id]);

				return (sql.affectedRows ? null : "Arquétipo não encontrado");
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_ROW_IS_REFERENCED":
						case "ER_ROW_IS_REFERENCED_2":
							return "Arquétipo em uso";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}
}

export = Arquetipo;
