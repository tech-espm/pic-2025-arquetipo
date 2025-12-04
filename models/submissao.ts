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

    public static async obterPorQuestionario(idquestionario: number, idusuario: number): Promise<Submissao[]|String> {
        let lista: Submissao[] = [];

        try{
            await app.sql.connect(async (sql) => {

            let departamentos = ((await sql.query("select qd.iddepartamento from questionario_departamento qd inner join usuario_departamento ud on qd.iddepartamento = ud.iddepartamento where idquestionario = ? and idusuario = ?", [idquestionario, idusuario])) as any[]).map((d) => d.iddepartamento);
            if (departamentos.length <= 0) {
                return "O usuário não tem acesso.";
            }

            lista = await sql.query(`Select p.nome as publico, s.nome, s.telefone, s.email, s.resposta from submissao s inner join publico p on s.idpublicoalvo = p.id where idquestionario = ? order by s.id desc;`, [idquestionario]);
        });
        }
        catch(e){
            return "Erro ao obter submissões: " + (e);
        }
        
        return lista;
    }
}

export = Submissao;