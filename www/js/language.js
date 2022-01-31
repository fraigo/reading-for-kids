var language = {
    "es" : {
        "lang" : "es",
        "title" : "Aprendizaje",
        "level" : "Nivel",
        "times" : "por",
        "timeout" : "Tiempo",
        "close": "Cerrar",
        "correct": "Correcto",
        "corrects": "Correctas",
        "restart": "Reiniciar",
        "errors": "Errores",
        "one": "Uno",
        "two": "Dos",
        "three": "Tres",
        "four": "Cuatro",
        "five" : "Cinco",
        "six" : "Seis",
        "seven" : "Siete",
        "eight" : "Ocho",
        "nine" : "Nueve",
        "ten" : "Diez",
        "stars": "Estrellas",
        "is": "es",
        "try_again": "Intenta denuevo",
        "user_profile": "Perfil usuario",
        "name": "Nombre",
        "age": "Edad",
        "save": "Guardar",
        "you_win" : "Terminado"
    },
    "en" : {
        "lang" : "en",
        "title" : "Learning Games",
        "level" : "Level",
        "times" : "times",
        "timeout" : "Timeout",
        "correct": "Correct",
        "one": "One",
        "two": "Two",
        "three": "Three",
        "stars": "Stars",
        "is": "is",
        "try_again": "Try again",
        "you_win" : "You win"
    },
    "selected" : "en"
}

language.id = function(expr){
    if (typeof(expr) == "undefined") {
        return expr
    }
    var id=expr.toLowerCase().replace(/ /g,'_').replace('?','').replace('(','').replace(')','')
    var replaced="áéíóú"
    var replacing="aeiou"
    for (var index = 0; index < replaced.length; index++) {
        id = id.replace(replaced.charAt(index), replacing.charAt(index));
    }
    return id
}

language.hasTranslation = function(expr, lang) {
    if (!lang) lang = language
    var key = language.key(expr)
    return lang[language.selected] && lang[language.selected][key]
}

language.translate = function(expr, lang) {
    if (!lang) lang = language
    expr = language.expr(expr, lang)
    var key = language.key(expr)
    if (lang[language.selected] && lang[language.selected][key]){
        return lang[language.selected][key]
    }
    return expr
}

language.expr = function(content,lang) {
    var result = content
    if (!lang) lang = language
    if (!content) return content
    if (typeof content == 'number') result = '' + result
    if (result.indexOf('{')>=0){
        var elements = result.match(/{[^{]+}/g)
        for (var idx = 0; idx < elements.length; idx++) {
            var reemp = elements[idx].substring(1,elements[idx].length-1)
            if (language.hasTranslation(reemp, lang)){
                result=result.replace(elements[idx],language.translate(reemp, lang))
            }
        }
    }
    return result
}

language.key = function(content){
    return language.id(content)
}
