import app = require("teem");
import Questionario = require("../models/questionario");
import Disponibilidade = require("../enums/disponibilidade");
import Publico = require("../enums/publico");
import appsettings = require("../appsettings");


class SubmissaoRoute {

    public static async criar(req: app.Request, res: app.Response) {
        const questionariourl = req.params["url"];
        const token = req.query["token"] as string;

        let questionario: Questionario = await Questionario.obterPorUrl(questionariourl as string);

        if (!questionario) {
            res.render("index/erro", {
                layout: "layout-externo",
                mensagem: "Questionário não encontrado."
            });
            return;
        }

        if (questionario.iddisponibilidade === Disponibilidade.Oculto || questionario.iddisponibilidade === Disponibilidade.Privado) {
            res.render("questionario/questionario-oculto-privado", {
                layout: "layout-externo",
                usuario: null,
                oculto: questionario.iddisponibilidade === Disponibilidade.Oculto ? true : false
            });
            return;
        }

        let paraFuncionarios: boolean = false;
        let paraAlunos: boolean = false;
        let paraExternos: boolean = false;

        if (questionario.idpublicosalvos) {
            for (let index = 0; index < questionario.idpublicosalvos.length; index++) {
                let publicoalvo: Publico = questionario.idpublicosalvos[index] as number;

                if (publicoalvo === Publico.Aluno) {
                    paraAlunos = true;
                } else if (publicoalvo === Publico.Funcionario) {
                    paraFuncionarios = true;
                } else if (publicoalvo === Publico.Externo) {
                    paraExternos = true;
                }
            }
        }

        const loginESPM = paraAlunos || paraFuncionarios;
        const cadastroExterno = paraExternos;

        let dadosToken: { nome: string, email: string, aluno: boolean } = null;
        let erroToken: string = null;
        const urlCallback = appsettings.ssoRedirBase + encodeURIComponent(appsettings.urlSite + "/teste/" + questionario.url);

        if (token) {
            try {
                const respostaApi = await app.request.json.get(appsettings.ssoToken + encodeURIComponent(token as string));

                if (!respostaApi.success || !respostaApi.result) {
                    erroToken = (respostaApi.result && respostaApi.result.toString()) || ("Erro de comunicação: " + respostaApi.statusCode);
                } else if (respostaApi.result.erro) {
                    erroToken = respostaApi.result.erro;
                } else {
                    dadosToken = {
                        email: respostaApi.result.dados.email,
                        nome: respostaApi.result.dados.nome,
                        aluno: respostaApi.result.dados.aluno
                    };
                }
            } catch (e) {
                erroToken = "Falha ao validar o login.";
            }
        }

        if (dadosToken) {
            if (paraAlunos && !paraFuncionarios && !cadastroExterno) {
                if (!dadosToken.aluno)
                    erroToken = "Esse questionário é exclusivo para alunos.";
            } else if (paraFuncionarios && !paraAlunos && !cadastroExterno) {
                if (dadosToken.aluno)
                    erroToken = "Esse questionário é exclusivo para funcionários.";
            }
        }

        if (erroToken) {
            res.render("questionario/login", {
                layout: "layout-externo",
                mensagem: erroToken,
                ssoRedir: urlCallback,
				item: questionario,
                titulo: questionario.nomeexterno
            });
            return;
        }

        res.render("questionario/questionario", {
            layout: "layout-externo-sem-card",
            titulo: questionario.nomeexterno,
            item: questionario,

            dadosToken: dadosToken,
            resposta : {},

            loginESPM: loginESPM,
            loginExterno: cadastroExterno,

            urlCallback: urlCallback,
        });
    }


}

export = SubmissaoRoute;