import app = require("teem");
import Submissao = require("../../models/submissao");
import Questionario = require("../../models/questionario");
import Perfil = require("../../enums/perfil");
import Publico = require("../../enums/publico");
import Arquetipo = require("../../models/arquetipo");

class SubmissaoApiRoute {

	@app.http.post()
	public static async criarOuEditar(req: app.Request, res: app.Response) {

		const arquetipoId = await Submissao.criar(req.body);

		if (typeof arquetipoId === "string") {
			res.status(400).json(arquetipoId);
			return;
		}

		const arquetipo = await Arquetipo.obter(arquetipoId, 0, Perfil.Administrador);

		res.json(arquetipo);
	}
}

export = SubmissaoApiRoute;



