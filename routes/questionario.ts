
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
import { count } from "console";

// Perguntar: adicionar o diretor ao departamento quando o proprio diretor criar o departamento? porque dessa forma eu sei de onde ele veio


class QuestionarioRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);

		//listar somente os departamentos que o usuário pode acessar
		if (!u)
			res.redirect(app.root + "/acesso");

		let departamentos: Departamento[] = [];
		if (u.admin) {
			departamentos = await Departamento.listarCombo();
		} else {
			let usuario = await Usuario.obter(u.id);
			departamentos = await Departamento.obter(usuario.iddepartamento as number[]);
		}

		res.render("questionario/editar", {
			titulo: "Criar Questionário",
			textoSubmit: "Criar",
			usuario: u,
			publicosalvos: publicos.lista,
			disponibilidades: disponibilidades.lista,
			departamentos: departamentos,
			item: null
		});
	}

	public static async editar(req: app.Request, res: app.Response) {

		//Perguntar: como atualizar os arquetipos quando o usuario altera o departamento? colocar uma regra no proprio no ejs ou atualização via api
		//Perguntar: devo verificar se o usuario tem acesso a esse questionario?


		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
			return null;
		}

		let id = parseInt(req.query["id"] as string);
		let item: Questionario = null;
		if (!isNaN(id)) {
			item = await Questionario.obter(id);
		}

		if (!item) {
			res.render("index/nao-encontrado", {
				layout: "layout-sem-form",
				usuario: u
			});
			return;
		}

		let departamentos: Departamento[] = [];
		let iddepartamento: number[] = [];
		if (u.admin) {
			departamentos = await Departamento.listarCombo();
			departamentos.forEach((e) => iddepartamento.push(e.id))
		} else {
			let usuario = await Usuario.obter(u.id);
			departamentos = await Departamento.obter(iddepartamento);
		}

		let arquetipos = await Arquetipo.listarPorDepartamentos(item.iddepartamento as number[]);

		res.render("questionario/editar", {
			titulo: "Editar Questionário",
			datatables: true,
			usuario: u,
			departamentos: departamentos,
			publicosalvos: publicos.lista,
			disponibilidades: disponibilidades.lista,
			arquetipos: arquetipos,
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
				lista: await Questionario.listar()
			});
	}


}

export = QuestionarioRoute;