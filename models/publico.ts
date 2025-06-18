import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Publico = require("../enums/publico");


// Manter sincronizado com enums/publico.ts e sql/script.sql
const publicos = new ListaNomeada([
	new ItemNomeado(Publico.Aluno, "Aluno"),
	new ItemNomeado(Publico.Funcionario, "Funcionário"),
	new ItemNomeado(Publico.Externo, "Externo"),
]);

export = publicos;
