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

	public static listar(): Promise<Departamento[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome from departamento")) || [];
		});
	}

	public static listarCombo(): Promise<Departamento[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome from departamento order by nome asc")) || [];
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
}

export = Departamento;
