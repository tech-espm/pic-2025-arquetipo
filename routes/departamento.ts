import app = require("teem");
import Departamento = require("../models/departamento");
import Usuario = require("../models/usuario");

class DepartamentoRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("departamento/editar", {
				titulo: "Criar Departamento",
				textoSubmit: "Criar",
				usuario: u,
				item: null,
			});
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Departamento = null;
			if (isNaN(id) || !(item = await Departamento.obter(id)))
				res.render("index/nao-encontrado", {
					layout: "layout-sem-form",
					usuario: u
				});
			else
				res.render("departamento/editar", {
					titulo: "Editar Departamento",
					usuario: u,
					item: item,
				});
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("departamento/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Departamentos",
				datatables: true,
				xlsx: true,
				usuario: u,
				lista: await Departamento.listar()
			});
	}
}

export = DepartamentoRoute;
