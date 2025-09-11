import app = require("teem");
import Validacao = require("../utils/validacao");


interface Submissao {
	id: number;
	idquestionario: number;
	nome: string | null;
	telefone: string | null;
	email: string | null;
	resposta: any;
}

class Submissao {
public static async criarOuEditar(submissao: Submissao, idquestionario: number): Promise<string | Submissao> {
	const erro = Submissao.validar(submissao);
	if (erro)
		return erro;

	try {
		await app.sql.connect(async (sql) => {
			let existente : number = await sql.scalar(
				"SELECT id FROM submissao WHERE idquestionario = ? AND email = ?",
				[idquestionario, submissao.email]
			);
			
			await sql.beginTransaction();


			if (existente) {
				await sql.query(
					`UPDATE submissao 
					   SET nome = ?, telefone = ?, resposta = ? 
					 WHERE id = ?`,
					[
						submissao.nome,
						submissao.telefone,
						JSON.stringify(submissao.resposta),
						existente
					]
				);
				submissao.id = existente;
			} else {
				await sql.query(
					`INSERT INTO submissao (idquestionario, nome, telefone, email, resposta)
					 VALUES (?, ?, ?, ?, ?)`,
					[
						submissao.idquestionario,
						submissao.nome,
						submissao.telefone,
						submissao.email,
						JSON.stringify(submissao.resposta)
					]
				);
				submissao.id = await sql.scalar("SELECT LAST_INSERT_ID()");
			}

			await sql.commit();
		});
	} catch (e) {
		return "Erro ao salvar submissão: " + (e instanceof Error ? e.message : e);
	}

	return submissao;
}


	public static validar(s: Submissao): string | null {
		if (!s) 
			return "Submissão inválida";

		if (!s.idquestionario || isNaN(s.idquestionario)) 
			return "Questionário inválido";

		if (!s.resposta) 
			return "Resposta obrigatória";

		if (!s.nome || s.nome.trim().length === 0)
			return "Nome obrigatório para respondentes externos";

		if (!s.email) 
			return "Email inválido";

		if (!s.telefone)
			return "Telefone inválido";

		return null; 
	}

	public static async criar(s: Submissao): Promise<string | Submissao> {
		const res = Submissao.validar(s);
		if (res)
			return res;

		try {
			await app.sql.connect(async (sql) => {
				await sql.query(`INSERT INTO submissao (idquestionario, nome, telefone, email, resposta) VALUES (?, ?, ?, ?, ?)`, [s.idquestionario, s.nome, s.telefone, s.email, JSON.stringify(s.resposta)]);
				s.id = await sql.scalar("SELECT LAST_INSERT_ID()");
			});
		} catch (e) {
			return "Erro ao salvar submissão: " + (e instanceof Error ? e.message : e);
		}

		return s;
	}

	public static async obterPorId(id: number): Promise<Submissao | null> {
		let s: Submissao = null;

		await app.sql.connect(async (sql) => {
			s = await sql.scalar(`
				SELECT id, idquestionario, nome, telefone, email, resposta FROM submissao WHERE id = ?`, [id]);
		});

		return s || null;
	}

	public static async obterResposta(idquestionario: number,email: string, idusuario?: number | null): Promise<Submissao | null> {

		return await app.sql.connect(async (sql) => {
			return await sql.scalar(`
				SELECT resposta FROM submissao WHERE email = ? and idquestionario = ?`, [email, idquestionario]);
		});
	}

	public static async listarPorQuestionario(idquestionario: number): Promise<Submissao[]> {
		let lista: Submissao[] = [];

		await app.sql.connect(async (sql) => {
			lista = await sql.query(`
				SELECT resposta FROM submissao WHERE idquestionario = ? ORDER BY id DESC`, [idquestionario]);
		});

		return lista || [];
	}



}

export = Submissao;