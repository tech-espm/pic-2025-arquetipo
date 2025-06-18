import app = require("teem");
import { randomBytes } from "crypto";
import appsettings = require("../appsettings");
import DataUtil = require("../utils/dataUtil");
import intToHex = require("../utils/intToHex");
import Validacao = require("../utils/validacao");
import Disponibilidade = require("../enums/disponibilidade");
import Arquetipo = require("./arquetipo");

interface Questionario {
    id: number;
    nome: string;
    nomeexterno: string;
    iddisponibilidade: Disponibilidade;
    anonimo: boolean;
    url: string;
    descricao: string;
    corfundopagina:string;
    corfundocard:string;
    cordestaque:string;
    cortextocard:string;
    cortextodestaque:string;
    criacao:string | null;
    textointroducao:string | null;
    questoes: any;
    
    //usado apenas no obter
    iddepartamento: number[] | string | null;
    idpublicoalvo: number[] | string | null;
    idarquetipos: number[] | string | null;
}


class Questionario {
    private static validar(questionario: Questionario, criacao: boolean): string {
        if (!questionario)
            return "Questionário inválido";

        questionario.id = parseInt(questionario.id as any);

        if (!criacao) {
            if (isNaN(questionario.id))
                return "Id inválido";
        }

        if (!questionario.nome || !(questionario.nome = questionario.nome.normalize().trim()) || questionario.nome.length > 100)
            return "Nome inválido";

        if (!questionario.nomeexterno || !(questionario.nomeexterno = questionario.nomeexterno.normalize().trim()) || questionario.nomeexterno.length > 100)
            return "Nome externo inválido";


        if (!questionario.descricao || !(questionario.descricao = questionario.descricao.normalize()) || questionario.descricao.length > 255)
            return "Descrição inválida";

   		if (isNaN(questionario.iddisponibilidade = parseInt(questionario.iddisponibilidade as any) as Disponibilidade))
			return "Disponibilidade inválida";

        if (questionario.anonimo != false && questionario.anonimo != true)
            return "Anônimo inválido";

        if (!questionario.url || !(questionario.url = questionario.url.normalize().trim()) || questionario.url.length > 100)
            return "URL inválida";

        if (!questionario.corfundopagina || !(questionario.corfundopagina = questionario.corfundopagina.normalize().trim()) || questionario.corfundopagina.length > 7)
            return "Cor de fundo da pagina inválida";

        if (!questionario.corfundocard || !(questionario.corfundocard = questionario.corfundocard.normalize().trim()) || questionario.corfundocard.length > 7)
            return "Cor de fundo do card inválida";

        if (!questionario.cordestaque || !(questionario.cordestaque = questionario.cordestaque.normalize().trim()) || questionario.cordestaque.length > 7)
            return "Cor de destaque inválida";

        if (!questionario.cortextocard || !(questionario.cortextocard = questionario.cortextocard.normalize().trim()) || questionario.cortextocard.length > 7)
            return "Cor do texto do card inválida";

        if (!questionario.cortextodestaque || !(questionario.cortextodestaque = questionario.cortextodestaque.normalize().trim()) || questionario.cortextodestaque.length > 7)
            return "Cor do texto de destaque inválida";

        if (!questionario.textointroducao || !(questionario.textointroducao = questionario.textointroducao.normalize().trim()) || questionario.textointroducao.length > 5000)
            return "Texto de introdução inválido";

		if (!questionario.iddepartamento || !questionario.iddepartamento.length) {
			questionario.iddepartamento = null;
		} else {
			questionario.iddepartamento = (questionario.iddepartamento as string).split(",").map(Number) as number[];
			for (let i = 0; i < questionario.iddepartamento.length; i++) {
				if (!questionario.iddepartamento[i])
					return "Departamento inválido";
			}
		}

        if (!questionario.idpublicoalvo || !questionario.idpublicoalvo.length) {
			questionario.idpublicoalvo = null;
		} else {
			questionario.idpublicoalvo = (questionario.idpublicoalvo as string).split(",").map(Number) as number[];
			for (let i = 0; i < questionario.idpublicoalvo.length; i++) {
				if (!questionario.idpublicoalvo[i])
					return "Público-alvo inválido";
			}
		}

        if(!questionario.idarquetipos || !questionario.idarquetipos.length) {
            questionario.idarquetipos = null;
        }
        else {
            questionario.idarquetipos = (questionario.idarquetipos as string).split(",").map(Number) as number[];
            for (let i = 0; i < questionario.idarquetipos.length; i++) {
                if (!questionario.idarquetipos[i])
                    return "Arquétipo inválido";
            }
        }

        return null;
    }

    public static listar(): Promise<Questionario[]> {
        return app.sql.connect(async (sql) => {
            return (await sql.query("select id, nome, nomeexterno, iddisponibilidade, anonimo, url, descricao, criacao from questionario")) || [];
        });
    }

    public static listarCombo(): Promise<Questionario[]> {
        return app.sql.connect(async (sql) => {
            return (await sql.query("select id, nome, nomeexterno, iddisponibilidade, anonimo, url, descricao, criacao from questionario order by nome asc")) || [];
        });
    }

    public static obter(id: number): Promise<Questionario> {
        return app.sql.connect(async (sql) => {
            const lista: Questionario[] = await sql.query("select id, nome, nomeexterno, iddisponibilidade, anonimo, url, descricao, corfundopagina, corfundocard, cordestaque, cortextocard, cortextodestaque, criacao, textointroducao, questoes  from questionario where id = ?", [id]);

            if (!lista || !lista[0])
                return null;

            const questionario = lista[0];
            questionario.iddepartamento = await sql.query("select iddepartamento from questionario_departamento where idquestionario = ?", [id]);
            questionario.idarquetipos = await sql.query("select idarquetipo from questionario_arquetipo where idquestionario = ?", [id]);
            questionario.idpublicoalvo = await sql.query("select idpublico from questionario_publico where idquestionario = ?", [id]);

            return lista[0];
        });
    }

    public static obterPeloNome(nome: string): Promise<Questionario> {
        return app.sql.connect(async (sql) => {
            const lista: Questionario[] = await sql.query("select id, nome, nomeexterno, iddisponibilidade, anonimo, url, descricao, corfundopagina, corfundocard, cordestaque, cortextocard, cortextodestaque, criacao, textointroducao, questoes from questionario where nome = ?", [nome]);

            if (!lista || !lista[0])
                return null;

            const questionario = lista[0];
            questionario.iddepartamento = await sql.query("select iddepartamento from questionario_departamento where idquestionario = ?", [questionario.id]);
            questionario.idarquetipos = await sql.query("select idarquetipo from questionario_arquetipo where idquestionario = ?", [questionario.id]);
            questionario.idpublicoalvo = await sql.query("select idpublico from questionario_publico where idquestionario = ?", [questionario.id]);

            return lista[0];
        });
    }

    private static async merge(	sql: app.Sql,	id: number,departamentos: number[] | null,idarquetipos: number[] | null,idpublicoalvo: number[] | null
) {
	if (!departamentos) departamentos = [];

	const existentes: { id: number, iddepartamento: number }[] = await sql.query(
		`SELECT id, iddepartamento FROM questionario_departamento WHERE idquestionario = ?`,
		[id]
	);
	const toRemove = existentes.filter(e => !departamentos.includes(e.iddepartamento));
	const toAdd = departamentos.filter(n => !existentes.some(e => e.iddepartamento === n));
	const toUpdate: typeof existentes = [];

	while (toRemove.length && toAdd.length) {
		const item = toRemove.pop()!;
		item.iddepartamento = toAdd.pop()!;
		toUpdate.push(item);
	}

	for (const item of toRemove)
		await sql.query(`DELETE FROM questionario_departamento WHERE id = ?`, [item.id]);

	for (const item of toUpdate)
		await sql.query(`UPDATE questionario_departamento SET iddepartamento = ? WHERE id = ?`, [item.iddepartamento, item.id]);

	for (const n of toAdd)
		await sql.query(`INSERT INTO questionario_departamento (idquestionario, iddepartamento) VALUES (?, ?)`, [id, n]);

	// Arquetipos
	if (!idarquetipos) idarquetipos = [];

	const existentesArquetipos: { id: number, idarquetipo: number }[] = await sql.query(
		`SELECT id, idarquetipo FROM questionario_arquetipo WHERE idquestionario = ?`,
		[id]
	);
	const toRemoveArquetipos = existentesArquetipos.filter(e => !idarquetipos.includes(e.idarquetipo));
	const toAddArquetipos = idarquetipos.filter(n => !existentesArquetipos.some(e => e.idarquetipo === n));
	const toUpdateArquetipos: typeof existentesArquetipos = [];

	while (toRemoveArquetipos.length && toAddArquetipos.length) {
		const item = toRemoveArquetipos.pop()!;
		item.idarquetipo = toAddArquetipos.pop()!;
		toUpdateArquetipos.push(item);
	}

	for (const item of toRemoveArquetipos)
		await sql.query(`DELETE FROM questionario_arquetipo WHERE id = ?`, [item.id]);

	for (const item of toUpdateArquetipos)
		await sql.query(`UPDATE questionario_arquetipo SET idarquetipo = ? WHERE id = ?`, [item.idarquetipo, item.id]);

	for (const n of toAddArquetipos)
		await sql.query(`INSERT INTO questionario_arquetipo (idquestionario, idarquetipo) VALUES (?, ?)`, [id, n]);

	// Público alvo
	if (!idpublicoalvo) idpublicoalvo = [];

	const existentesPublico: { id: number, idpublico: number }[] = await sql.query(
		`SELECT id, idpublico FROM questionario_publico WHERE idquestionario = ?`,
		[id]
	);
	const toRemovePublico = existentesPublico.filter(e => !idpublicoalvo!.includes(e.idpublico));
	const toAddPublico = idpublicoalvo.filter(n => !existentesPublico.some(e => e.idpublico === n));
	const toUpdatePublico: typeof existentesPublico = [];

	while (toRemovePublico.length && toAddPublico.length) {
		const item = toRemovePublico.pop()!;
		item.idpublico = toAddPublico.pop()!;
		toUpdatePublico.push(item);
	}

	for (const item of toRemovePublico)
		await sql.query(`DELETE FROM questionario_publico WHERE id = ?`, [item.id]);

	for (const item of toUpdatePublico)
		await sql.query(`UPDATE questionario_publico SET idpublico = ? WHERE id = ?`, [item.idpublico, item.id]);

	for (const n of toAddPublico)
		await sql.query(`INSERT INTO questionario_publico (idquestionario, idpublico) VALUES (?, ?)`, [id, n]);
}


    public static async criar(questionario: Questionario): Promise<string | null> {
        const res = Questionario.validar(questionario, true);
        if (res)
            return res;

        return app.sql.connect(async (sql) => {
            await sql.beginTransaction();

            try {
            await sql.query("insert into questionario (nome, nomeexterno, iddisponibilidade, anonimo, url, descricao, corfundopagina, corfundocard, cordestaque, cortextocard, cortextodestaque, criacao) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [questionario.nome, questionario.nomeexterno, questionario.iddisponibilidade, questionario.anonimo, questionario.url, questionario.descricao, questionario.corfundopagina, questionario.corfundocard, questionario.cordestaque, questionario.cortextocard, questionario.cortextodestaque, questionario.criacao]);

                questionario.id = (await sql.scalar("select last_insert_id()")) as number;

                await Questionario.merge(sql, questionario.id, questionario.iddepartamento as number[], questionario.idarquetipos as number[], questionario.idpublicoalvo as number[]);

                await sql.commit();

                return null;
            } catch (e) {
                if (e.code === "ER_DUP_ENTRY") {
                    if (e.message.includes("nome")) {
                        return `O nome ${questionario.nome} já está em uso`;
                    }
                    return "Já existe um registro com dados duplicados";
                }
                throw e;
            }
        });
    }

    public static async editar(questionario: Questionario): Promise<string | null> {
        const res = Questionario.validar(questionario, false);
        if (res)
            return res;

        return app.sql.connect(async (sql) => {
            try {
                await sql.query("update questionario set nome=?, nomeexterno=?, iddisponibilidade=?, anonimo=?, url=?, descricao=?, corfundopagina=?, corfundocard=?, cordestaque=?, cortextocard=?, cortextodestaque=?, criacao=?, textointroducao=?, questoes=? where id = ?", [questionario.nome, questionario.nomeexterno, questionario.iddisponibilidade, questionario.anonimo, questionario.url, questionario.descricao, questionario.corfundopagina, questionario.corfundocard, questionario.cordestaque, questionario.cortextocard, questionario.cortextodestaque, questionario.criacao, questionario.textointroducao, questionario.questoes, questionario.id]);

                if (!sql.affectedRows)
                    return "Questionário não encontrado";

                await Questionario.merge(sql, questionario.id, questionario.iddepartamento as number[], questionario.idarquetipos as number[], questionario.idpublicoalvo as number[]);

                await sql.commit();

                return null;
            } catch (e) {
                if (e.code === "ER_DUP_ENTRY" && typeof e.message === "string") {
                    if (e.message.includes("nome")) {
                        return `O nome ${questionario.nome} já está em uso`;
                    }
                    return "Já existe um registro com dados duplicados";
                }
                throw e;
            }

        });
    }

    public static async excluir(id: number): Promise<string | null> {
        return app.sql.connect(async (sql) => {
            try {
                await sql.query("delete from questionario where id = ?", [id]);

                return (sql.affectedRows ? null : "Questionário não encontrado");
            } catch (e) {
                if (e.code) {
                    switch (e.code) {
                        case "ER_ROW_IS_REFERENCED":
                        case "ER_ROW_IS_REFERENCED_2":
                            return "Questionário em uso";
                        default:
                            throw e;
                    }
                } else {
                    throw e;
                }
            }
        });
    }
}

export = Questionario;
