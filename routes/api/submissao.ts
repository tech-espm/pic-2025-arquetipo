import app = require("teem");
import Usuario = require("../../models/usuario");
import Arquetipo = require("../../models/arquetipo");
import Submissao = require("../../models/submissao");
import Questionario = require("../../models/questionario");
import { json } from "express";
import Publico = require("../../enums/publico");
import Perfil = require("../../enums/perfil");

class SubmissaoApiRoute {

	@app.http.post()
	@app.route.formData()
	public static async obter(req: app.Request, res: app.Response) {
		const email = req.body["email"] as string;
		const idquestionario = parseInt(req.body["idquestionario"] as string);

		if (!email || !idquestionario) {
			res.status(400).json("Id do questinário e/ou email inválidos");
			return;
		}

		const resposta : Submissao = await  Submissao.obterResposta(idquestionario, email);

		if (!resposta) {
			res.json({mensagem: "Não cadastrado"});
			return;
		}

		res.json(resposta);
	}


	@app.http.post()
	public static async criarOuEditar(req: app.Request, res: app.Response) {
		const submissao :Submissao = req.body;

		if (!submissao.idquestionario){
			res.json("Id do questionário nulo").status(400);
			return;
		}

		const questionario = await Questionario.obter(submissao.idquestionario, 0, Perfil.Administrador);

		if (!questionario){
			res.json("Questionário nulo").status(400);
			return;
		}

		let paraTodos: boolean = false;
		let paraFuncionarios :boolean = false;
		let paraAlunos : boolean = false;		
		for (let index = 0; index < questionario.idpublicosalvos.length; index++) {
			let publicoalvo : Publico = questionario.idpublicosalvos[index]["idpublicoalvo"];
			if (publicoalvo === Publico.Funcionario){paraFuncionarios = true;}
			else if(publicoalvo === Publico.Aluno){paraAlunos = true;}
			else if(publicoalvo === Publico.Externo){paraTodos = true;}
		}

		if ((paraFuncionarios || paraAlunos) && !paraTodos){
			// Essa validação acontecerá com email, cookie, token? Pegar o token na hora que ele loga para responder e mandar junto com requisção e fazer a validação desse token aqui?
			Submissao.validarRespondente(submissao.email);
		}

		const r = await Submissao.criarOuEditar(req.body, parseInt(req.body.idquestionario));
		const r2 = await Arquetipo.obter(parseInt(req.body.resposta.arquetipoid), 0, Perfil.Administrador);

		if (typeof r === "string") 
			res.status(400);

		if (typeof r2 === "string") 
			res.status(400);

		res.json(r2);
	}

}

export = SubmissaoApiRoute;
