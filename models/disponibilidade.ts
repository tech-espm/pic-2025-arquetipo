import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Disponibilidade = require("../enums/disponibilidade");


// Manter sincronizado com enums/disponibilidade.ts e sql/script.sql
const disponibilidades = new ListaNomeada([
	new ItemNomeado(Disponibilidade.Publico, "Público"),
	new ItemNomeado(Disponibilidade.Privado, "Privado"),
	new ItemNomeado(Disponibilidade.Oculto, "Oculto"),
]);

export = disponibilidades;
