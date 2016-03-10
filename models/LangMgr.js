function LangMgr() {
    var curLang;
    var texts = [];

    var langs = [
        {
            id: 5,
            name: "English",
            short_name: "EN"
        },
        {
            id: 5,
            name: "German",
            short_name: "DE"
        },
        {
            id: 5,
            name: "Spanish",
            short_name: "ES"
        },
         {
             id: 5,
             name: "French",
             short_name: "FR"
         }
    ];

    this.getAllLangs = function(){
        return langs;
    }

    this.setTranslation = function (lang, translations) {
        texts[lang] = translations;
    }

    this.getCurLang = function () {
        if(curLang){
            return curLang;
        }
        else{
            if (localStorage.langaugeSelected && localStorage.langaugeSelected != "") {
                this.setCurLang(eval("(" + localStorage.langaugeSelected + ")"));
            }
            else {
                this.setCurLang(langs[0]);
            }
            return curLang;
        }
    }

    this.setCurLang = function(lang){
        curLang = lang;
        localStorage.langaugeSelected = JSON.stringify(lang);        
    }

    this.getTranslation = function (translationId, params) {
        var tstr = texts[curLang.short_name][translationId];
        if (!tstr) {
            tstr = texts["EN"][translationId];
        }
        if (params) {
            if (!$.isArray(params)) {
                params = [params];
            }
            tstr = tstr.replace(/\{(\d*)\}/g,
                function (match, $1, offset, original) {
                    return params[$1 * 1];
                });
        }

        return tstr;
    }
}

var langMgr = new LangMgr();
langMgr.getCurLang();