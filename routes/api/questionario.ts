import app = require("teem");
import Departamento = require("../../models/departamento");
import Perfil = require("../../enums/perfil");
import Usuario = require("../../models/usuario");
import Arquetipo = require("../../models/arquetipo");
import Questionario = require("../../models/questionario");

class QuestionarioApiRoute {

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
		const questionario = await Questionario.obter(id);

		if (!questionario) {
			res.status(404).json("Arquetipo não encontrado");
			return;
		}

		res.send(questionario);
	}

	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, false, false);
		if (!u)
			return;

		console.log("Criando questionário", req.body);
	
        //Perguntar: o quão fundo eu vou na regra de negócio da api? Nesse caso, o admin pode criar arquetipos, mas o diretor não pode criar arquetipos que não sejam de um dos seus departamentos e nem o usuario comum.
        // Isso se aplica aqui tbm mas é melhor pensar pela a rota de arquetipo

		const erro = await Questionario.criar(req.body);

		if (erro) {
			res.status(400).json(erro);
			return;
		}
        
		res.sendStatus(204);
	}
}

export = QuestionarioApiRoute;