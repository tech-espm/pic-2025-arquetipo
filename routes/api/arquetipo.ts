import app = require("teem");
import Usuario = require("../../models/usuario");
import Arquetipo = require("../../models/arquetipo");

class ArquetipoApiRoute {

	@app.http.get()
	public static async obter(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		const id = parseInt(req.query["id"] as string);

		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}
		const arquetipo = await Arquetipo.obter(id, u.id, u.idperfil);

		if (!arquetipo) {
			res.status(404).json("Arquetipo não encontrado");
			return;
		}

		res.send(arquetipo);
	}

	@app.http.post()
	@app.route.formData()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		const r = await Arquetipo.criar(req.body, u.id, u.idperfil, req.uploadedFiles.imagem);

		if (typeof r === "string")
			res.status(400);

		res.json(r);
	}

	@app.http.post()
	@app.route.formData()
	public static async editar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		const r = await Arquetipo.editar(req.body, u.id, u.idperfil, req.uploadedFiles.imagem);

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
			res.status(403).json("Usuário não tem permissão para excluir arquetipos");
			return;
		}
		const id = parseInt(req.query["id"] as string);


		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}

		const erro = await Arquetipo.excluir(id, u.id, u.idperfil);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}
}

export = ArquetipoApiRoute;
