import app = require("teem");
import appsettings = require("../appsettings");
import Usuario = require("../models/usuario");
import QuestionarioRoute = require("./questionario");
import SubmissaoRoute = require("./submissao");

class IndexRoute {
	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("index/index", {
				layout: "layout-sem-form",
				titulo: "Dashboard",
				usuario: u
			});
	}


	@app.http.all()
	public static async login(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);

		const token = req.query["token"] as string;
		const callback = req.query["callback"] as string;

		const redir = callback ? appsettings.ssoRedir + encodeURIComponent("?callback="+callback) : appsettings.ssoRedir;

		if (!u) {
			if (token) {
				const [mensagem, u] = await Usuario.efetuarLogin(token, res);

				if (mensagem) {
					res.render("index/login", { layout: "layout-externo", mensagem: mensagem, ssoRedir: redir });
				} else {
					if (callback) {
						res.redirect(decodeURIComponent(callback));
					} else {
						res.redirect(app.root + "/");
					}
				}
			} else {
				res.render("index/login", { layout: "layout-externo", mensagem: null, ssoRedir: redir });
			}
		} else {
			if (callback) {
				res.redirect(decodeURIComponent(callback));
			} else {
				res.redirect(app.root + "/");
			}
		}
	}


	public static async acesso(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("index/acesso", {
				layout: "layout-sem-form",
				titulo: "Sem Permissão",
				usuario: u
			});
	}

	public static async perfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/");
		else
			res.render("index/perfil", {
				titulo: "Meu Perfil",
				usuario: u
			});
	}

	public static async logout(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (u)
			await Usuario.efetuarLogout(u, res);
		res.redirect(app.root + "/");
	}

	@app.route.methodName("teste/:url")
	public static async teste(req: app.Request, res: app.Response) {
		const url = req.params["url"];

		if (!url){
			res.render("index/nao-encontrado", {
				layout: "layout-sem-form",
				usuario: null
			});
			return;
		}
		
		SubmissaoRoute.criar(req, res);
	}
}

export = IndexRoute;
