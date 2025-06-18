import app = require("teem");
import Departamento = require("../models/departamento");
import Usuario = require("../models/usuario");
import Arquetipo = require("../models/arquetipo");

class ArquetipoRoute {
	public static async criar(req: app.Request, res: app.Response) {
		// Perguntar: o metodo cookie pode preencher o array iddepartamento? Nesse momento sou forçado a usar o metodo obter
		// Perguntar: posso colocar um metodo que retorna o array de Departamentos do usuário na model de usuario? reparei que uma classe nao conhece mais nada alem dela mesma
		// Perguntar: o departamento vai ter mais de um diretor?
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

		res.render("arquetipo/editar", {
			titulo: "Criar Arquétipo",
			textoSubmit: "Criar",
			usuario: u,
			departamentos: departamentos,
			item: null
		});
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
			return null;
		}

		let departamentos: Departamento[] = [];

		if (u.admin) {
			departamentos = await Departamento.listarCombo();
		} else {
			let usuario = await Usuario.obter(u.id);
			departamentos = await Departamento.obter(usuario.iddepartamento as number[]);
		}

		let id = parseInt(req.query["id"] as string);
		let nome = req.query["nome"] as string;
		let item: Arquetipo = null;

		if (!isNaN(id)) {
			item = await Arquetipo.obter(id);
		} else if (nome) {
			item = await Arquetipo.obterPeloNome(nome);
		}

		if (!item) {
			res.render("index/nao-encontrado", {
				layout: "layout-sem-form",
				usuario: u
			});
			return;
		} else {
			res.render("arquetipo/editar", {
				titulo: "Editar Arquétipo",
				departamentos: departamentos,
				usuario: u,
				item: item,
			});
		}
		
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("arquetipo/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Arquétipos",
				datatables: true,
				xlsx: true,
				usuario: u,
				lista: await Arquetipo.listar()
			});
	}
}

export = ArquetipoRoute;
