import app = require("teem");
import Submissao = require("../../models/submissao");
import Questionario = require("../../models/questionario");
import Perfil = require("../../enums/perfil");
import Publico = require("../../enums/publico");
import Arquetipo = require("../../models/arquetipo");

class SubmissaoApiRoute {

	@app.http.post()
	public static async criarOuEditar(req: app.Request, res: app.Response) {

		const submissao: Submissao = {
			id: null,
			idquestionario: req.body.idquestionario,
			nome: req.body.nome,
			telefone: req.body.telefone,
			email: req.body.email,
			idpublicoalvo: req.body.telefone ? (req.body.aluno ? Publico.Aluno : Publico.Funcionario) : Publico.Externo,
			resposta: req.body.resposta
		};

		const arquetipoId = await Submissao.criar(submissao);

		if (typeof arquetipoId === "string") {
			res.status(400).json(arquetipoId);
			return;
		}

		const arquetipo = await Arquetipo.obter(arquetipoId, 0, Perfil.Administrador);

		res.json(arquetipo);
	}
}

export = SubmissaoApiRoute;



