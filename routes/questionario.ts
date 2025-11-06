
import app = require("teem");
import Departamento = require("../models/departamento");
import Usuario = require("../models/usuario");
import Arquetipo = require("../models/arquetipo");
import disponibilidades = require("../models/disponibilidade");
import publicos = require("../models/publico");
import Questionario = require("../models/questionario");
import Perfil = require("../enums/perfil");


class QuestionarioRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);

		//listar somente os departamentos que o usuário pode acessar
		if (!u)
			res.redirect(app.root + "/acesso");

		res.render("questionario/editar", {
			titulo: "Criar Questionário",
			textoSubmit: "Criar",
			usuario: u,
			publicosalvos: publicos.lista,
			disponibilidades: disponibilidades.lista,
			departamentos: await Departamento.listarCombo(u.id, u.idperfil),
			item: null
		});
	}

	public static async editar(req: app.Request, res: app.Response) {

		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
			return null;
		}

		let id = parseInt(req.query["id"] as string);
		let item: Questionario = null;
		if (!isNaN(id)) {
			item = await Questionario.obter(id, u.id, u.idperfil);
		}

		if (!item) {
			res.render("index/nao-encontrado", {
				layout: "layout-sem-form",
				usuario: u
			});
			return;
		}

		// Deve exibir todos os arquétipos dos departamentos do questionário, independente
		// dos departamentos que o usuário tem acesso.
		res.render("questionario/editar", {
			titulo: "Editar Questionário",
			datatables: true,
			usuario: u,
			departamentos: await Departamento.listarCombo(u.id, u.idperfil),
			publicosalvos: publicos.lista,
			disponibilidades: disponibilidades.lista,
			arquetipos: await Arquetipo.listarComboPorQuestionario(item.id),
			item: item
		});

	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("questionario/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Questionários",
				datatables: true,
				xlsx: true,
				usuario: u,
				lista: await Questionario.listar(u.id, u.idperfil)
			});
	}


}

export = QuestionarioRoute;