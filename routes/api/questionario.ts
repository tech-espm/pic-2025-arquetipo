import app = require("teem");
import Usuario = require("../../models/usuario");
import Questionario = require("../../models/questionario");
import { parse } from "path";
import Arquetipo = require("../../models/arquetipo");

class QuestionarioApiRoute {
	@app.http.get()
	public static async obter(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		//Tarefa: Verifica se o usuário tem permissão para acessar o questionário pelo departamento

		const id = parseInt(req.query["id"] as string);
		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}

		const questionario = await Questionario.obter(id);

		if (!questionario) {
			res.status(404).json("Questionário não encontrado");
			return;
		}

		res.send(questionario);
	}

	@app.http.post()
	@app.route.formData()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		// Perguntar: todo usuário vai estar em um departamento ou todo questionario pertence a um departamento? senão, terei que fazer alterações nas queries para suportar questionarios sem departamento, ou seja, só são visiveis para aquele usuario e o admin
		// Resposta: o questionario não está ligado com nenhum usuario ele está ligado somente com os departamentos

		const r = await Questionario.criar(
			req.body,
			req.uploadedFiles.imagemintroducao,
			req.uploadedFiles.imagemquestionario,
			req.uploadedFiles.imagemlogo
		);

		if (typeof r === "string")
			res.status(400);

		res.json(r);
	}

@app.http.post()
@app.route.formData()
public static async editar(req: app.Request, res: app.Response) {
	// verificar se os arquetipos batem com o questionario;
	const u = await Usuario.cookie(req, res, false, false);
	if (!u)
		return;

	const id = parseInt(req.body.id);
	if (isNaN(id)) {
		res.status(400).json("Id inválido");
		return;
	}

	const questionario = await Questionario.obter(id);
	if (!questionario) {
		res.status(404).json("Questionário não encontrado");
		return;
	}

	
	const r = await Questionario.editar(
		req.body,
		req.uploadedFiles.imagemintroducao,
		req.uploadedFiles.imagemquestionario,
		req.uploadedFiles.imagemlogo
	);

	if (typeof r === "string")
		res.status(400);

	res.json(r);
}


	@app.http.delete()
	public static async excluir(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		if (!(u.admin || u.diretor)) {
			res.status(403).json("Usuário não tem permissão para excluir questionários");
			return;
		}

		const id = parseInt(req.query["id"] as string);
		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}

		const erro = await Questionario.excluir(id);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

}

export = QuestionarioApiRoute;
