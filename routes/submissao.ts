
import app = require("teem");
import Departamento = require("../models/departamento");
import Usuario = require("../models/usuario");
import Arquetipo = require("../models/arquetipo");
import disponibilidades = require("../models/disponibilidade");
import publicos = require("../models/publico");
import Questionario = require("../models/questionario");
import Disponibilidade = require("../enums/disponibilidade");
import Publico = require("../enums/publico");
import Submissao = require("../models/submissao");
import { response } from "express";
import appsettings = require("../appsettings");


class SubmissaoRoute {

	public static async criar(req: app.Request, res: app.Response) {


		const questionariourl = req.params["url"];
		let item: Questionario = await Questionario.obterPorUrl(questionariourl as string);

		if (!item) {
			res.render("index/erro", {
				layout: "layout-externo",
				mensagem: "Questionário não encontrado."
			});
			return;
		}

		if (item.iddisponibilidade === Disponibilidade.Oculto || item.iddisponibilidade === Disponibilidade.Privado) {
			res.render("questionario/questionario-oculto-privado", {
				layout: "layout-externo",
				usuario: null,
				oculto: item.iddisponibilidade === Disponibilidade.Oculto ? true : false
			});	
			return;
		}

		let aluno : boolean;
		let resposta: Submissao;
		let paraTodos: boolean = false;
		let paraFuncionarios :boolean = false;
		let paraAlunos : boolean = false;
		
		for (let index = 0; index < item.idpublicosalvos.length; index++) {
			if (item.idpublicosalvos[index]["idpublicoalvo"] === Publico.Funcionario){
				paraFuncionarios = true;
			}else if(item.idpublicosalvos[index]["idpublicoalvo"] === Publico.Aluno){
				paraAlunos = true;
			}else if(item.idpublicosalvos[index]["idpublicoalvo"] === Publico.Externo){
				paraTodos = true;
			}
		}

		// refazer lógica para autorização
		const u = await Usuario.cookie(req,null,false,false);

		if ((paraAlunos || paraFuncionarios) && !paraTodos) {

			if (!u) {
				const callback = encodeURIComponent(appsettings.urlSite + req.originalUrl);
				res.redirect(app.root + "/login?callback=" + callback);
				return;
			}

			resposta = await Submissao.obterResposta(item.id, u.email, u.id);

			paraTodos = false;
		}else{
			paraTodos = true;
		}
		
			res.render("questionario/questionario", {
				layout: "layout-externo-sem-card",
				usuario: u,
				item: item,
				paraTodos: paraTodos,
				aluno: aluno,
				resposta: resposta
			})
	}

	
}

export = SubmissaoRoute;