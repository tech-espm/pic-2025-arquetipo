import app = require("teem");
import Validacao = require("../utils/validacao");
import Publico = require("../enums/publico");
import Questionario = require("./questionario");
import Perfil = require("../enums/perfil");
import Arquetipo = require("./arquetipo");
import DataUtil = require("../utils/dataUtil");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");

interface Submissao {
    id: number | null;
    idquestionario: number;
    idpublicoalvo: Publico;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    resposta: any;

	// Utilizado apenas na comunicação com a tela
    hash?: string | null;
}

class Submissao {

	public static criarHash(nome: string, email: string, aluno: number | boolean): string | null {
		if (!nome || !email)
			return null;
		return GeradorHash.sha256(nome.normalize().trim() + "|" + email.normalize().trim().toLowerCase() + "|" + (aluno ? 1 : 0) + "|" + appsettings.chaveToken);
	}
    
	public static validar(questionario: Questionario, s: Submissao): string | null {
        if (!s)
            return "Submissão inválida";
        
        if (!(s.idpublicoalvo = parseInt(s.idpublicoalvo as any)) || !(questionario.idpublicosalvos as number[]).includes(s.idpublicoalvo)){
            return "Público inválido";
        }
        
		if (questionario.anonimo) {
			s.email = null;
			s.nome = null;
			s.telefone = null;
		} else {
			if (!(s.nome = (s.nome || "").normalize().trim()) || s.nome.length > 255)
				return "Nome inválido";

			if (!(s.email = (s.email || "").normalize().trim().toLowerCase()) || !Validacao.isEmail(s.email) || s.email.length > 255)
				return "E-mail inválido";

			if (!(s.telefone = (s.telefone || "").normalize().trim()))
				s.telefone = null;
			else if (s.telefone.length < 14 || s.telefone.length > 15)
				return "Telefone inválido";

			if (s.email.endsWith("@espm.br") || s.email.endsWith("@acad.espm.br") || s.idpublicoalvo === Publico.Aluno || s.idpublicoalvo === Publico.Funcionario) {
				const hash = Submissao.criarHash(s.nome, s.email, s.idpublicoalvo === Publico.Aluno);
				if (!hash || !s.hash || hash !== s.hash)
					return "Chave de segurança inválida";
			}

		}


		if (!s.resposta) 
            return "Resposta obrigatória";

        return null; 
    }

    public static async criar(s: Submissao): Promise<string | number> {
		let questionario: Questionario;

		let erro = await app.sql.connect(async (sql) => {
			questionario = await Questionario.obter(parseInt(s.idquestionario as any) || 0, 0, Perfil.Administrador);

			if (!questionario)
				return "Questionário inválido";

			return null;
		});

		if (erro)
            return erro;

		erro = await Submissao.validar(questionario, s);

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
                await sql.query(`Insert into submissao (idquestionario, idarquetipo, idpublicoalvo, data, nome, telefone, email, resposta) values (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    					   				s.idquestionario, arquetipoId, s.idpublicoalvo, DataUtil.horarioDeBrasiliaISOComHorario(), s.nome, s.telefone || null,s.email, JSON.stringify(s.resposta)]);
            });

        } catch (e) {
            if (e.toString().indexOf("submissao.submissao_email_UN") >= 0){
                return "Email já utilizado para essa pesquisa.";
            }
            if (e.toString().indexOf("submissao.fk_submissao_validacao_publico") >= 0){
                return "Público inválido.";
            }

            return "Erro ao salvar submissão: " + (e);
        }

        return Number(arquetipoId);
    }

    public static async obterPorQuestionario(idusuario: number, idperfil: Perfil, idquestionario: number, data_inicial: string | null, data_final: string | null): Promise<string | any> {
        if (!idquestionario)
			return "Questionário inválido";

		if (!(data_inicial = DataUtil.converterDataISO(data_inicial)))
			return "Data inicial inválida";

		if (!(data_final = DataUtil.converterDataISO(data_final)))
			return "Data final inválida";

		if (data_inicial > data_final)
			return "Data inicial não pode ser maior que a data final";

		data_inicial += " 00:00:00";
		data_final += " 23:59:59";

		const questionario = await Questionario.obter(idquestionario, idusuario, idperfil);
		if (!questionario)
			return "Questionário não encontrado";

		return await app.sql.connect(async (sql) => {
            const submissoes: any[] = await sql.query(`select p.nome publico, s.nome, s.telefone, s.email, a.nome arquetipo, date_format(s.data, '%d/%m/%Y %H:%i') data, s.resposta from submissao s inner join publico p on s.idpublicoalvo = p.id left join arquetipo a on a.id = s.idarquetipo where idquestionario = ? and s.data between ? and ?`, [idquestionario, data_inicial, data_final]);

			const questoes: any[] = questionario.questoes as any;

			for (let i = 0; i < submissoes.length; i++) {
				const submissao = submissoes[i];
				const respostas = submissao.resposta;
				delete submissao.resposta;

				for (let j = 0; j < questoes.length; j++) {
					const questao = questoes[j];
					const alternativas = questao.alternativas;

					submissao["q" + j] = null;

					for (let k = 0; k < alternativas.length; k++) {
						const alternativa = alternativas[k];
						if (respostas[questao.id] == alternativa.arquetipoid) {
							submissao["q" + j] = alternativa.texto;
							break;
						}
					}
				}
			}

			return {
				arquetipos: (await sql.query("select a.nome from questionario_arquetipo qa inner join arquetipo a on a.id = qa.idarquetipo where qa.idquestionario = ?", [idquestionario])) as any[],
				submissoes,
				questoes,
			};
		});
    }
}

export = Submissao;