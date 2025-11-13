import app = require("teem");
import Perfil = require("../enums/perfil");
import Departamento = require("./departamento");

interface Questionario {
	id: number;
	nome: string;
	nomeexterno: string;
	iddisponibilidade: number;
	anonimo: boolean | number;
	url: string;
	descricao: string;
	corfundopagina: string;
	corfundocard: string;
	cordestaque: string;
	cortextocard: string;
	cortextodestaque: string;
	criacao: string | null;
	textointroducao: string | null;
	questoes: string;
	excluir_imagem_introducao?: number | null;
	excluir_imagem_questionario?: number | null;
	excluir_imagem_logo?: number | null;

	//usado apenas no obter
	iddepartamento: number[] | string | null;
	idpublicosalvos: number[] | string | null;
	idarquetipos: number[] | string | null;
}

class Questionario {
	private static validar(
		questionario: Questionario,
		criacao: boolean,
		imagemintroducao?: app.UploadedFile | null,
		imagemquestionario?: app.UploadedFile | null,
		imagemlogo?: app.UploadedFile | null
	): string {
		if (!questionario) return "Questionário inválido";

		questionario.id = parseInt(questionario.id as any);

		if (!criacao) {
			if (isNaN(questionario.id)) return "Id inválido";
		}

		if (
			!questionario.nome ||
			!(questionario.nome = questionario.nome.normalize().trim()) ||
			questionario.nome.length > 100
		)
			return "Nome inválido";

		if (
			!questionario.nomeexterno ||
			!(questionario.nomeexterno = questionario.nomeexterno.normalize().trim()) ||
			questionario.nomeexterno.length > 100
		)
			return "Nome externo inválido";

		if (
			!questionario.url ||
			!(questionario.url = questionario.url.normalize().trim()) ||
			questionario.url.length > 100
		)
			return "URL inválida.";

		if (
			!questionario.descricao ||
			!(questionario.descricao = questionario.descricao.normalize().trim()) ||
			questionario.descricao.length > 1000
		)
			return "Descrição inválida";

		if (
			!questionario.corfundopagina ||
			!(questionario.corfundopagina = questionario.corfundopagina.trim()) ||
			questionario.corfundopagina.length > 7
		)
			return "Cor de fundo da página inválida";

		if (
			!questionario.corfundocard ||
			!(questionario.corfundocard = questionario.corfundocard.trim()) ||
			questionario.corfundocard.length > 7
		)
			return "Cor de fundo do card inválida";

		if (
			!questionario.cordestaque ||
			!(questionario.cordestaque = questionario.cordestaque.trim()) ||
			questionario.cordestaque.length > 7
		)
			return "Cor de destaque inválida";

		if (
			!questionario.cortextocard ||
			!(questionario.cortextocard = questionario.cortextocard.trim()) ||
			questionario.cortextocard.length > 7
		)
			return "Cor do texto do card inválida";

		if (
			!questionario.cortextodestaque ||
			!(questionario.cortextodestaque = questionario.cortextodestaque.trim()) ||
			questionario.cortextodestaque.length > 7
		)
			return "Cor do texto de destaque inválida";

		// if (!questionario.anonimo)
		//  return "Valor de anonimato inválido";

		if (imagemintroducao && imagemintroducao.size > 16 * 1024 * 1024)
			return "O tamanho da imagem não pode ser maior que 16MB";

		if (imagemquestionario && imagemquestionario.size > 16 * 1024 * 1024)
			return "O tamanho da imagem não pode ser maior que 16MB";

		if (imagemlogo && imagemlogo.size > 2 * 1024 * 1024) return "O tamanho da imagem não pode ser maior que 2MB";

		if (!questionario.iddisponibilidade || isNaN(parseInt(questionario.iddisponibilidade as any)))
			return "Disponibilidade inválida";

		// Validação dos relacionamentos - obg gpt
		const relacionamentos = {
			iddepartamento: "Departamento inválido",
			idpublicosalvos: "Público-alvo inválido",
			idarquetipos: "Arquétipo inválido"
		};

		for (const campo in relacionamentos) {
			if (!questionario[campo] || !(questionario[campo] as any).length) {
				questionario[campo] = null;
			} else {
				questionario[campo] = (questionario[campo] as string).split(",").map(Number) as number[];
				for (let i = 0; i < (questionario[campo] as number[]).length; i++) {
					if (!(questionario[campo] as number[])[i]) return relacionamentos[campo];
				}
			}
		}

		return null;
	}

	public static listar(idusuario: number, idperfil: Perfil): Promise<Questionario[]> {
		return app.sql.connect(async (sql) => {
			if (idperfil == Perfil.Administrador)
				return ((await sql.query("select q.id, q.nome, q.nomeexterno, q.iddisponibilidade, q.anonimo, q.url, q.descricao, q.criacao, (select group_concat(d.nome order by d.nome asc separator ', ') from questionario_departamento qd inner join departamento d on d.id = qd.iddepartamento where qd.idquestionario = q.id) departamentos from questionario q")) || []);

			return (
				(await sql.query(
					`select tmp.id, q.nome, q.nomeexterno, q.iddisponibilidade, q.anonimo, q.url, q.descricao, q.criacao,
           (select group_concat(d.nome order by d.nome asc separator ', ') from questionario_departamento qd inner join departamento d on d.id = qd.iddepartamento where qd.idquestionario = tmp.id) departamentos
           from (
             select distinct qd.idquestionario id
             from usuario_departamento ud
             inner join questionario_departamento qd on qd.iddepartamento = ud.iddepartamento
             where ud.idusuario = ?
           ) tmp
           inner join questionario q on q.id = tmp.id
          `,
					[idusuario]
				)) || []
			);
		});
	}

	public static listarCombo(idusuario: number, idperfil: Perfil): Promise<Questionario[]> {
		return app.sql.connect(async (sql) => {
			if (idperfil == Perfil.Administrador)
				return (await sql.query("select id, nome from questionario order by nome asc")) || [];

			return (
				(await sql.query(
					`select tmp.id, q.nome from (
            select distinct qd.idquestionario id
            from usuario_departamento ud
            inner join questionario_departamento qd on qd.iddepartamento = ud.iddepartamento
            where ud.idusuario = ?
          ) tmp
          inner join questionario q on q.id = tmp.id
          order by q.nome asc
          `,
					[idusuario]
				)) || []
			);
		});
	}

	public static obter(id: number, idusuario: number, idperfil: Perfil): Promise<Questionario> {
		return app.sql.connect(async (sql) => {
			const lista: Questionario[] = await sql.query("select id, nome,nomeexterno,iddisponibilidade,anonimo,url,descricao,textointroducao,corfundopagina,corfundocard,cordestaque,cortextocard,cortextodestaque, questoes,versaointroducao, versaoquestionario, versaologo from questionario where id = ?", [id]);

			if (!lista || !lista[0])
				return null;

			const questionario = lista[0];

			questionario.iddepartamento = ((await sql.query("select iddepartamento from questionario_departamento where idquestionario = ?", [id])) as any[]).map((d) => d.iddepartamento);

			questionario.idpublicosalvos = ((await sql.query("select idpublicoalvo from questionario_publicoalvo where idquestionario = ?", [id])) as any[]).map((d) => d.idpublicoalvo);

			questionario.idarquetipos = ((await sql.query("select idarquetipo from questionario_arquetipo where idquestionario = ?", [id])) as any[]).map((d) => d.idarquetipo);

			if (idperfil === Perfil.Administrador) {
				return questionario;
			} else {
				const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);
				if (usuarioDepartamentos.some(iddepartamento => (questionario.iddepartamento as number[]).includes(iddepartamento)))
					return questionario;
			}

			return null;
		});
	}

	public static async obterPorUrl(url: string): Promise<Questionario | null> {
		return app.sql.connect(async (sql) => {
			const lista: Questionario[] = await sql.query("select id, nomeexterno,iddisponibilidade,anonimo,url,descricao,textointroducao,corfundopagina,corfundocard,cordestaque,cortextocard,cortextodestaque, questoes,versaointroducao, versaoquestionario, versaologo from questionario where url = ?", [url]);

			if (!lista || !lista[0])
				return null;

			const questionario = lista[0];

			questionario.iddepartamento = ((await sql.query("select iddepartamento from questionario_departamento where idquestionario = ?", [questionario.id])) as any[]).map((d) => d.iddepartamento);

			questionario.idpublicosalvos = ((await sql.query("select idpublicoalvo from questionario_publicoalvo where idquestionario = ?", [questionario.id])) as any[]).map((d) => d.idpublicoalvo);

			questionario.idarquetipos = ((await sql.query("select idarquetipo from questionario_arquetipo where idquestionario = ?", [questionario.id])) as any[]).map((d) => d.idarquetipo);

			return questionario;
		});
	}

	private static async merge(sql: app.Sql, id: number, arquetipos: number[] | null, publicosalvos: number[] | null, departamentos: number[] | null) {
		if (!departamentos)
			departamentos = [];

		const existentesDepartamentos: { id: number; iddepartamento: number }[] = await sql.query(`SELECT id, iddepartamento FROM questionario_departamento WHERE idquestionario = ?`, [id]);
		const toRemoveDepartamentos = existentesDepartamentos.filter((e) => !(departamentos as number[]).includes(e.iddepartamento));
		const toAddDepartamentos = departamentos.filter((n) => !existentesDepartamentos.some((e) => e.iddepartamento === n));
		const toUpdateDepartamentos: typeof existentesDepartamentos = [];

		while (toRemoveDepartamentos.length && toAddDepartamentos.length) {
			const item = toRemoveDepartamentos.pop() as (typeof existentesDepartamentos)[number];
			item.iddepartamento = toAddDepartamentos.pop() as number;
			toUpdateDepartamentos.push(item);
		}

		for (let i = 0; i < toRemoveDepartamentos.length; i++)
			await sql.query(`DELETE FROM questionario_departamento WHERE id = ?`, [toRemoveDepartamentos[i].id]);

		for (let i = 0; i < toUpdateDepartamentos.length; i++)
			await sql.query(`UPDATE questionario_departamento SET iddepartamento = ? WHERE id = ?`, [toUpdateDepartamentos[i].iddepartamento, toUpdateDepartamentos[i].id]);

		for (let i = 0; i < toAddDepartamentos.length; i++)
			await sql.query(`INSERT INTO questionario_departamento (idquestionario, iddepartamento) VALUES (?, ?)`, [id, toAddDepartamentos[i]]);

		if (!arquetipos)
			arquetipos = [];

		const existentesArquetipos: { id: number; idarquetipo: number }[] = await sql.query(`SELECT id, idarquetipo FROM questionario_arquetipo WHERE idquestionario = ?`, [id]);
		const toRemoveArquetipos = existentesArquetipos.filter((e) => !(arquetipos as number[]).includes(e.idarquetipo));
		const toAddArquetipos = arquetipos.filter((n) => !existentesArquetipos.some((e) => e.idarquetipo === n));
		const toUpdateArquetipos: typeof existentesArquetipos = [];

		while (toRemoveArquetipos.length && toAddArquetipos.length) {
			const item = toRemoveArquetipos.pop() as (typeof existentesArquetipos)[number];
			item.idarquetipo = toAddArquetipos.pop() as number;
			toUpdateArquetipos.push(item);
		}

		for (let i = 0; i < toRemoveArquetipos.length; i++)
			await sql.query(`DELETE FROM questionario_arquetipo WHERE id = ?`, [toRemoveArquetipos[i].id]);

		for (let i = 0; i < toUpdateArquetipos.length; i++)
			await sql.query(`UPDATE questionario_arquetipo SET idarquetipo = ? WHERE id = ?`, [toUpdateArquetipos[i].idarquetipo, toUpdateArquetipos[i].id]);

		for (let i = 0; i < toAddArquetipos.length; i++)
			await sql.query(`INSERT INTO questionario_arquetipo (idquestionario, idarquetipo) VALUES (?, ?)`, [id, toAddArquetipos[i]]);

		if (!publicosalvos)
			publicosalvos = [];

		const existentesPublicos: { id: number; idpublicoalvo: number }[] = await sql.query(`SELECT id, idpublicoalvo FROM questionario_publicoalvo WHERE idquestionario = ?`, [id]);
		const toRemovePublicos = existentesPublicos.filter((e) => !(publicosalvos as number[]).includes(e.idpublicoalvo));
		const toAddPublicos = publicosalvos.filter((n) => !existentesPublicos.some((e) => e.idpublicoalvo === n));
		const toUpdatePublicos: typeof existentesPublicos = [];

		while (toRemovePublicos.length && toAddPublicos.length) {
			const item = toRemovePublicos.pop() as (typeof existentesPublicos)[number];
			item.idpublicoalvo = toAddPublicos.pop() as number;
			toUpdatePublicos.push(item);
		}

		for (let i = 0; i < toRemovePublicos.length; i++)
			await sql.query(`DELETE FROM questionario_publicoalvo WHERE id = ?`, [toRemovePublicos[i].id]);

		for (let i = 0; i < toUpdatePublicos.length; i++)
			await sql.query(`UPDATE questionario_publicoalvo SET idpublicoalvo = ? WHERE id = ?`, [toUpdatePublicos[i].idpublicoalvo, toUpdatePublicos[i].id]);

		for (let i = 0; i < toAddPublicos.length; i++)
			await sql.query(`INSERT INTO questionario_publicoalvo (idquestionario, idpublicoalvo) VALUES (?, ?)`, [id, toAddPublicos[i]]);
	}

	public static async criar(questionario: Questionario, idusuario: number, idperfil: Perfil, imagemintroducao?: app.UploadedFile | null, imagemquestionario?: app.UploadedFile | null, imagemlogo?: app.UploadedFile | null): Promise<string | number> {
		const res = Questionario.validar(questionario, true, imagemintroducao, imagemquestionario, imagemlogo);
		if (res) return res;

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			if (idperfil !== Perfil.Administrador) {
				if (questionario.iddepartamento) {
					const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);
					if ((questionario.iddepartamento as number[]).some(iddepartamento => !usuarioDepartamentos.includes(iddepartamento)))
						return "Departamento não encontrado";
				}

				if (!questionario.iddepartamento || !questionario.iddepartamento.length)
					return "É necessário selecionar ao menos um departamento para criar o arquétipo";
			}

			try {
				await sql.query(
					"insert into questionario (nome, nomeexterno, iddisponibilidade, anonimo, url, descricao, corfundopagina, corfundocard, cordestaque, cortextocard, cortextodestaque, criacao, textointroducao, versaointroducao, versaoquestionario, versaologo) values (?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?)",
					[
						questionario.nome,
						questionario.nomeexterno,
						questionario.iddisponibilidade,
						questionario.anonimo,
						questionario.url,
						questionario.descricao,
						questionario.corfundopagina,
						questionario.corfundocard,
						questionario.cordestaque,
						questionario.cortextocard,
						questionario.cortextodestaque,
						questionario.textointroducao,
						imagemintroducao ? 1 : 0,
						imagemquestionario ? 1 : 0,
						imagemlogo ? 1 : 0
					]
				);

				questionario.id = (await sql.scalar("select last_insert_id()")) as number;

				await Questionario.merge(sql, questionario.id, [], questionario.idpublicosalvos as number[], questionario.iddepartamento as number[]);

				// Não precisa validar os departamentos aqui, porque o questionário ainda não possui arquétipos associados.

				if (imagemintroducao)
					await app.fileSystem.saveUploadedFile(
						"public/img/questionario/introducao/" + questionario.id + ".jpg",
						imagemintroducao
					);

				if (imagemquestionario)
					await app.fileSystem.saveUploadedFile(
						"public/img/questionario/" + questionario.id + ".jpg",
						imagemquestionario
					);

				if (imagemlogo)
					await app.fileSystem.saveUploadedFile(
						"public/img/questionario/logo/" + questionario.id + ".jpg",
						imagemlogo
					);

				await sql.commit();

				return questionario.id;
			} catch (e) {
				if (e.code === "ER_DUP_ENTRY" && typeof e.message === "string") {
					if (e.message.includes("nomeexterno")) {
						return `O nome externo ${questionario.nomeexterno} já está em uso`;
					}
					if (e.message.includes("nome")) {
						return `O nome ${questionario.nome} já está em uso`;
					}

					if (e.message.includes("url")) {
						return `O URL ${questionario.url} já está em uso`;
					}
					return "Já existe um registro com dados duplicados";
				}
				throw e;
			}
		});
	}

	public static async editar(questionario: Questionario, idusuario: number, idperfil: Perfil, imagemintroducao?: app.UploadedFile | null, imagemquestionario?: app.UploadedFile | null, imagemlogo?: app.UploadedFile | null): Promise<string | number> {
		const res = Questionario.validar(questionario, false, imagemintroducao, imagemquestionario, imagemlogo);
		if (res) return res;

		questionario.excluir_imagem_introducao = parseInt(questionario.excluir_imagem_introducao as any) ? 1 : 0;
		questionario.excluir_imagem_questionario = parseInt(questionario.excluir_imagem_questionario as any) ? 1 : 0;
		questionario.excluir_imagem_logo = parseInt(questionario.excluir_imagem_logo as any) ? 1 : 0;

		return app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			if (idperfil !== Perfil.Administrador) {
				const usuarioDepartamentos: number[] = (await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [idusuario]) as any[]).map(d => d.iddepartamento);

				if (questionario.iddepartamento) {
					if ((questionario.iddepartamento as number[]).some(iddepartamento => !usuarioDepartamentos.includes(iddepartamento)))
						return "Departamento não encontrado";
				}

				if (!questionario.iddepartamento || !questionario.iddepartamento.length)
					return "É necessário selecionar ao menos um departamento para editar o questionário";

				// Faz de conta que o usuário selecionou todos os departamentos aos quais ele não teria acesso,
				// para que o merge não cause impacto, excluindo os departamentos que ele não tem acesso.
				let existentes: number[] = (await sql.query(`SELECT iddepartamento FROM questionario_departamento WHERE idquestionario = ?`, [questionario.id]) as any[]).map(d => d.iddepartamento);
				if (existentes.length) {
					if (!existentes.some(iddepartamento => usuarioDepartamentos.includes(iddepartamento)))
						return "Questionário não encontrado";

					existentes = existentes.filter(iddepartamento => !usuarioDepartamentos.includes(iddepartamento));
					if (!questionario.iddepartamento)
						questionario.iddepartamento = [];
					(questionario.iddepartamento as number[]).push(...existentes);
				} else {
					return "Questionário não encontrado";
				}
			}

			try {
				await sql.query(
					`
        update questionario set
          nome = ?,
          nomeexterno = ?,
          descricao = ?,
          url = ?,
          textointroducao = ?,
          anonimo = ?,
          iddisponibilidade = ?,
          corfundopagina = ?,
          corfundocard = ?,
          cortextocard = ?,
          cordestaque = ?,
          cortextodestaque = ?,
          questoes = ?
        where id = ?
      `,
					[
						questionario.nome,
						questionario.nomeexterno,
						questionario.descricao,
						questionario.url,
						questionario.textointroducao,
						questionario.anonimo,
						questionario.iddisponibilidade,
						questionario.corfundopagina,
						questionario.corfundocard,
						questionario.cortextocard,
						questionario.cordestaque,
						questionario.cortextodestaque,
						questionario.questoes,
						questionario.id
					]
				);

				if (!sql.affectedRows) return "Questionário não encontrado";

				await Questionario.merge(
					sql,
					questionario.id,
					questionario.idarquetipos as number[],
					questionario.idpublicosalvos as number[],
					questionario.iddepartamento as number[]
				);

				const iddepartamentoQuestionario = (await sql.query("SELECT iddepartamento FROM questionario_departamento WHERE idquestionario = ?", [questionario.id]) as any[]).map(d => d.iddepartamento);
				const idarquetipoQuestionario = (await sql.query("SELECT idarquetipo FROM questionario_arquetipo WHERE idquestionario = ?", [questionario.id]) as any[]).map(d => d.idarquetipo);

				for (let i = idarquetipoQuestionario.length - 1; i >= 0; i--) {
					const erroValidacaoDepartamentos = await Departamento.validarDepartamentos(sql, idarquetipoQuestionario[i], null, questionario.id, iddepartamentoQuestionario);
					if (erroValidacaoDepartamentos)
						return erroValidacaoDepartamentos;
				}

				// Correção Arquitetural: Chamando o método refatorado "atualizarImagem"
				// uma vez por campo, sem o array redundante.
				await Questionario.atualizarImagem(
					sql,
					"introducao",
					`public/img/questionario/introducao/${questionario.id}.jpg`,
					imagemintroducao,
					!!questionario.excluir_imagem_introducao,
					questionario.id
				);
				await Questionario.atualizarImagem(
					sql,
					"questionario",
					`public/img/questionario/${questionario.id}.jpg`,
					imagemquestionario,
					!!questionario.excluir_imagem_questionario,
					questionario.id
				);
				await Questionario.atualizarImagem(
					sql,
					"logo",
					`public/img/questionario/logo/${questionario.id}.jpg`,
					imagemlogo,
					!!questionario.excluir_imagem_logo,
					questionario.id
				);

				await sql.commit();

				return questionario.id;
			} catch (e) {
				if (e.code === "ER_DUP_ENTRY" && typeof e.message === "string") {
					if (e.message.includes("nomeexterno"))
						return `O nome externo ${questionario.nomeexterno} já está em uso`;
					if (e.message.includes("nome")) return `O nome ${questionario.nome} já está em uso`;
					if (e.message.includes("url")) return `A URL ${questionario.url} já está em uso`;
					return "Já existe um registro com dados duplicados";
				}
				throw e;
			}
		});
	}

	private static async atualizarImagem(
		sql: app.Sql,
		campo: string,
		caminho: string,
		imagem: app.UploadedFile | null | undefined,
		excluir: boolean,
		id: number
	) {
		// Lógica refatorada: sem loop, processa apenas o "campo" recebido.
		// O nome da coluna de versão é construído dinamicamente.
		const colunaVersao = `versao${campo}`;

		let versaoAtual: number = await sql.scalar(`select ${colunaVersao} from questionario where id = ?`, [id]);

		if (excluir) {
			versaoAtual = -(Math.abs(versaoAtual) + 1);

			// ESTA É A CORREÇÃO PRINCIPAL:
			// Atualizando a coluna de versão (ex: "versaointroducao"), e não a coluna "introducao".
			await sql.query(`UPDATE questionario SET ${colunaVersao} = ? WHERE id = ?`, [versaoAtual, id]);

			if (await app.fileSystem.exists(caminho)) {
				await app.fileSystem.deleteFile(caminho);
			}
		} else if (imagem) {
			versaoAtual = Math.abs(versaoAtual) + 1;
			await sql.query(`UPDATE questionario SET ${colunaVersao} = ? WHERE id = ?`, [versaoAtual, id]);
			await app.fileSystem.saveUploadedFile(caminho, imagem);
		}
	}

	public static async excluir(id: number, idusuario: number, idperfil: Perfil): Promise<string | null> {
		return app.sql.connect(async (sql) => {
			if (idperfil !== Perfil.Administrador) {
				const usuarioDepartamentos: number[] = (
					(await sql.query("select iddepartamento from usuario_departamento where idusuario = ?", [
						idusuario
					])) as any[]
				).map((d) => d.iddepartamento);

				const existentes: number[] = (
					(await sql.query(`SELECT iddepartamento FROM questionario_departamento WHERE idquestionario = ?`, [
						id
					])) as any[]
				).map((d) => d.iddepartamento);
				if (existentes.length) {
					if (!existentes.some((iddepartamento) => usuarioDepartamentos.includes(iddepartamento)))
						return "Questionário não encontrado";
				} else {
					return "Questionário não encontrado";
				}
			}

			try {
				await sql.query("delete from questionario where id = ?", [id]);

				return sql.affectedRows ? null : "Questionário não encontrado";
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_ROW_IS_REFERENCED":
						case "ER_ROW_IS_REFERENCED_2":
							return "Questionário em uso";
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

export = Questionario;
