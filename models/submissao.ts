import app = require("teem");
import Validacao = require("../utils/validacao");
import Publico = require("../enums/publico");
import Questionario = require("./questionario");
import Perfil = require("../enums/perfil");
import Arquetipo = require("./arquetipo");

interface Submissao {
    id: number | null;
    idquestionario: number;
    idpublicoalvo: Publico;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    resposta: any;
}

class Submissao {

    public static validar(s: Submissao): string | null {
        if (!s) 
            return "Submissão inválida";

        if (!s.idquestionario || isNaN(s.idquestionario)) 
            return "Questionário inválido";

        if (!s.idpublicoalvo || !(s.idpublicoalvo == Publico.Aluno || s.idpublicoalvo == Publico.Funcionario || s.idpublicoalvo == Publico.Externo))
            return "Público alvo inválido";

        if (!s.nome)
            return "Nome inválido";

        if (!s.email || !Validacao.isEmail(s.email))
            return "Email inválido";

        if (!s.resposta) 
            return "Resposta obrigatória";

        return null; 
    }

    public static async criar(s: Submissao): Promise<string | number> {
        const erro = Submissao.validar(s);
        if (erro)
            return erro;

        const counts: Record<string, number> = {};
        for (const key in s.resposta) {
            const id = s.resposta[key] as number; 
            counts[id] = (counts[id] || 0) + 1;
        }
        const arquetipoId = s.resposta.arquetipoid = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        try {
            await app.sql.connect(async (sql) => {
				const questionario: Questionario = await Questionario.obter(s.idquestionario, 0, Perfil.Administrador);

				if (!questionario)
					"Questionário inválido";

				if (questionario.anonimo == 1){
					s.email = null;
					s.nome = null;
					s.telefone = null;
				}

                await sql.query(`Insert into submissao (idquestionario, idpublicoalvo, nome, telefone, email, resposta) values (?, ?, ?, ?, ?, ?)`, [
                    					   				s.idquestionario, s.idpublicoalvo, s.nome, s.telefone || null,s.email, JSON.stringify(s.resposta)]);
            });

        } catch (e) {
            if (e.toString().indexOf("submissao.submissao_email_UN") >= 0){
                return "Email já utilizado para essa pesquisa.";
            }

            return "Erro ao salvar submissão: " + (e);
        }

        return Number(arquetipoId);
    }

    public static async obterPorQuestionario(idquestionario: number): Promise<Submissao[]> {
        let lista: Submissao[] = [];

        await app.sql.connect(async (sql) => {
            lista = await sql.query(`Select idpublicoalvo, nome, telefone, email, resposta from submissao where idquestionario = ? order by id desc`, [idquestionario]);
        });
        return lista || [];
    }
}

export = Submissao;