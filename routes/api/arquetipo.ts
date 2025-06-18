import app = require("teem");
import Departamento = require("../../models/departamento");
import Perfil = require("../../enums/perfil");
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
		const arquetipo = await Arquetipo.obter(id);

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

		//Perguntar: o quão fundo eu vou na regra de negócio da api? Nesse caso, o admin pode criar arquetipos, mas o diretor não pode criar arquetipos que não sejam de um dos seus departamentos e nem o usuario comum.

		const r = await Arquetipo.criar(req.body, req.uploadedFiles.imagem);

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

		const r = await Arquetipo.editar(req.body, req.uploadedFiles.imagem);

		//Perguntar: o quão fundo eu vou na regra de negócio? Nesse caso, o admin pode editar arquetipos, mas o diretor não pode editar arquetipos que não sejam de um dos seus departamentos.		

		if (typeof r === "string")
			res.status(400);

		res.json(r);
	}

	@app.http.delete()
	public static async excluir(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		//Perguntar: o quão fundo eu vou na regra de negócio? Nesse caso, o admin pode criar arquetipos, mas o diretor não pode criar arquetipos que não sejam de um dos seus departamentos.
		if (!(u.admin || u.diretor)) {
			res.status(403).json("Usuário não tem permissão para excluir arquetipos");
			return;
		}
		const id = parseInt(req.query["id"] as string);


		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}

		const erro = await Arquetipo.excluir(id);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}
}

export = ArquetipoApiRoute;
