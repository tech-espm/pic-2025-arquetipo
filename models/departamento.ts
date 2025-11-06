import app = require("teem");
import { randomBytes } from "crypto";
import appsettings = require("../appsettings");
import DataUtil = require("../utils/dataUtil");
import GeradorHash = require("../utils/geradorHash");
import intToHex = require("../utils/intToHex");
import Perfil = require("../enums/perfil");
import Validacao = require("../utils/validacao");

interface Departamento {
	id: number;
	nome: string;
}

class Departamento {
	private static validar(departamento: Departamento, criacao: boolean): string {
		if (!departamento)
			return "Departamento inválido";

		departamento.id = parseInt(departamento.id as any);

		if (!criacao) {
			if (isNaN(departamento.id))
				return "Id inválido";
		}

		if (!departamento.nome || !(departamento.nome = departamento.nome.normalize().trim()) || departamento.nome.length > 100)
			return "Nome inválido";

		return null;
	}

	public static listar(idusuario: number, idperfil: Perfil): Promise<Departamento[]> {
        return app.sql.connect(async (sql) => {
            if (idperfil === Perfil.Administrador) {
                return (await sql.query("SELECT id, nome FROM departamento")) || [];
            }

            return (await sql.query(
                `SELECT d.id, d.nome
                 FROM departamento d
                 INNER JOIN usuario_departamento ud ON d.id = ud.iddepartamento
                 WHERE ud.idusuario = ?`,
                [idusuario]
            )) || [];
        });
    }

	public static listarCombo(idusuario: number, idperfil: Perfil): Promise<Departamento[]> {
        return app.sql.connect(async (sql) => {
            if (idperfil === Perfil.Administrador) {
                return (await sql.query("SELECT id, nome FROM departamento ORDER BY nome ASC")) || [];
            }

            return (await sql.query(
                `SELECT d.id, d.nome
                 FROM departamento d
                 INNER JOIN usuario_departamento ud ON d.id = ud.iddepartamento
                 WHERE ud.idusuario = ?
                 ORDER BY d.nome ASC`,
                [idusuario]
            )) || [];
        });
    }

	public static listarPorQuestionario(idquestionario: number): Promise<Departamento[]> {
		return app.sql.connect(async (sql) => {

				const lista: Departamento[] = await sql.query(`select d.id, d.nome from questionario_departamento qd
																inner join departamento d on qd.iddepartamento = d.id
																where qd.idquestionario = ?`, [idquestionario]);
				return lista || [];
		});
	}

	public static obter(id: number): Promise<Departamento | null>;
	public static obter(id: number[]): Promise<Departamento[]>;
	public static obter(id: number | number[]): Promise<Departamento | Departamento[] | null> {
		return app.sql.connect(async (sql) => {
			if (id instanceof Array) {
				if (!id.length) return [];
				for (let x = 0; x < id.length; x++) {
					id[x] = parseInt(id[x] as any) || 0;
				}
				const lista: Departamento[] = await sql.query(`select id, nome from departamento where id in (${id.join(",")})`);
				return lista || [];
			} else {
				const lista: Departamento[] = await sql.query("select id, nome from departamento where id = ?", [id]);
				if (!lista || !lista[0])
					return null;
				return lista[0];
			}
		});
	}

	public static async criar(departamento: Departamento): Promise<string | null> {
		const res = Departamento.validar(departamento, true);
		if (res)
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into departamento (nome) values (?)", [departamento.nome]);

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return `O nome ${departamento.nome} já está em uso`;
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async editar(departamento: Departamento): Promise<string | null> {
		const res = Departamento.validar(departamento, false);
		if (res)
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("update departamento set nome = ? where id = ?", [departamento.nome, departamento.id]);
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return `O nome ${departamento.nome} já está em uso`;
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}

			return (sql.affectedRows ? null : "Departamento não encontrado");
		});
	}

	public static async excluir(id: number): Promise<string | null> {
		return app.sql.connect(async (sql) => {
			try {
				await sql.query("delete from departamento where id = ?", [id]);

				return (sql.affectedRows ? null : "Departamento não encontrado");
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_ROW_IS_REFERENCED":
						case "ER_ROW_IS_REFERENCED_2":
							return "Departamento em uso";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async validarDepartamentos(sql: app.Sql, idarquetipo: number, iddepartamentoArquetipo: number[] | null, idquestionario: number, iddepartamentoQuestionario: number[] | null): Promise<string | null> {
		// Toda vez que editar um questionário ou arquétipo, é necessário comparar o conjunto de departamentos do questionário
		// com o conjunto de departamentos do arquétipo, para garantir que o conjunto de departamentos do arquétipo seja um
		// superconjunto do conjunto de departamentos do questionário.

		if (!iddepartamentoArquetipo)
			iddepartamentoArquetipo = (await sql.query("SELECT iddepartamento FROM arquetipo_departamento WHERE idarquetipo = ?", [idarquetipo]) as any[]).map(d => d.iddepartamento);

		if (!iddepartamentoQuestionario)
			iddepartamentoQuestionario = (await sql.query("SELECT iddepartamento FROM questionario_departamento WHERE idquestionario = ?", [idquestionario]) as any[]).map(d => d.iddepartamento);

		const nomeArquetipo: string | null = await sql.scalar("SELECT nome FROM arquetipo WHERE id = ?", [idarquetipo]);
		if (!nomeArquetipo)
			return "Arquétipo não encontrado";

		const nomeQuestionario: string | null = await sql.scalar("SELECT nome FROM questionario WHERE id = ?", [idquestionario]);
		if (!nomeQuestionario)
			return "Questionário não encontrado";

		if (iddepartamentoArquetipo.length < iddepartamentoQuestionario.length)
			return `O conjunto de departamentos do arquétipo ${nomeArquetipo} não é um superconjunto do conjunto de departamentos do questionário ${nomeQuestionario}`;

		for (let i = iddepartamentoQuestionario.length - 1; i >= 0; i--) {
			const iddepartamento = iddepartamentoQuestionario[i];
			if (!iddepartamentoArquetipo.includes(iddepartamento)) {
				const nomeDepartamento: string | null = await sql.scalar("SELECT nome FROM departamento WHERE id = ?", [iddepartamento]);
				if (!nomeDepartamento)
					return "Departamento não encontrado";
				return `O departamento ${nomeDepartamento} faz parte do questionário ${nomeQuestionario}, mas não faz parte do arquétipo ${nomeArquetipo}`;
			}
		}

		return null;
	}
}

export = Departamento;
