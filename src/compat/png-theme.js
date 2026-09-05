window.__hubPngTema = (function () {
  try {
    var v = window.hubStorage.getItem("hubPngTema");
    return v === "claro" || v === "viva" ? v : "escuro";
  } catch (e) {
    return "escuro";
  }
})();
window.__aplicarPaletaClara = function (ctx) {
  var MAPA = {
    "#0a0f38": "#FDF7F0",
    "#0b1030": "#FDF7F0",
    "#141d3d": "#FFFFFF",
    "#111845": "#FFFFFF",
    "#141c57": "#F5EBDD",
    "#10164a": "#FFFFFF",
    "#0a0e3f": "#F5EBDD",
    "#0c1142": "#FFFFFF",
    "#141a57": "#F5EBDD",
    "#b7bdd4": "#4A5570",
    "#070b2e": "#FCEFE4",
    "#05081f": "#FAE3D3",
    /* fundos proprios do PNG da Mesa de RV — sem estes o fundo ficava
       quase preto e o texto virava cinza escuro por cima: ilegivel */
    "#070809": "#FDF7F0",
    "#0c0e14": "#FCEFE4",
    "#13161d": "#F3E7DA",
    "#8a93d8": "#4A55A8",
    "#ff5566": "#C0392B",
    "#ff8b52": "#C0450A",
    "#fff": "#12233F",
    "#ffffff": "#12233F",
    "#a9b0d6": "#6E7787",
    "#8089be": "#8A93A6",
    "#6f77a8": "#9AA2B2",
    "#cfd4ef": "#33405C",
    "#8a92c0": "#8A93A6",
    "rgba(28,36,112,.35)": "#FFFFFF",
    "rgba(28,36,112,.45)": "#FFFFFF",
    "rgba(255,255,255,.04)": "#FFFFFF",
    "rgba(255,255,255,.05)": "#FFFFFF",
    "rgba(255,255,255,.06)": "#FFFFFF",
    "rgba(255,255,255,.08)": "rgba(18,35,63,.05)",
    "rgba(255,255,255,.10)": "rgba(18,35,63,.06)",
    "rgba(255,255,255,.12)": "rgba(18,35,63,.07)",
    "rgba(255,255,255,.025)": "rgba(18,35,63,.02)",
    "rgba(255,255,255,0.025)": "rgba(18,35,63,.02)",
    "rgba(120,130,210,.10)": "rgba(18,35,63,.07)",
    "rgba(120,130,210,.13)": "rgba(18,35,63,.08)",
    "rgba(120,130,210,.18)": "rgba(18,35,63,.10)",
    "rgba(120,130,210,.22)": "rgba(18,35,63,.12)",
    "#2bd9a6": "#12A66F",
    "#f5b942": "#C2831B",
    "#ffb020": "#C2831B",
    "#5b8def": "#5B6EE8",
    "#9b6bff": "#8B5CF6",
    "#36c5f0": "#0E86AD",
    "#ff8b52": "#FF6B1A",
    "#ff6b2c": "#FF4D00",
    "#f26522": "#FF4D00",
    "rgba(242,101,34,.14)": "rgba(255,77,0,.08)",
    "rgba(242,101,34,.16)": "rgba(255,77,0,.09)",
    "rgba(242,101,34,.10)": "rgba(255,77,0,.07)",
    "rgba(242,101,34,.3)": "rgba(255,77,0,.28)",
    "rgba(255,107,44,.05)": "rgba(255,77,0,.05)",
    "rgba(255,107,44,.07)": "rgba(255,77,0,.06)",
    "rgba(255,107,44,.08)": "rgba(255,77,0,.06)",
    "rgba(255,107,44,.4)": "rgba(255,77,0,.35)",
    "rgba(43,217,166,.06)": "rgba(18,166,111,.07)",
    "rgba(43,217,166,.12)": "rgba(18,166,111,.10)",
    "rgba(43,217,166,.35)": "rgba(18,166,111,.30)",
    "rgba(245,185,66,.08)": "rgba(194,131,27,.08)",
    "rgba(245,185,66,.10)": "rgba(194,131,27,.10)",
    "rgba(245,185,66,.12)": "rgba(194,131,27,.12)",
    "rgba(245,185,66,.14)": "rgba(194,131,27,.13)",
    "rgba(245,185,66,.16)": "rgba(194,131,27,.14)",
    "rgba(245,185,66,.3)": "rgba(194,131,27,.30)",
  };
  function conv(v) {
    if (typeof v !== "string") return v;
    var k = v.trim().toLowerCase().replace(/\s+/g, "");
    return MAPA[k] || v;
  }
  ["fillStyle", "strokeStyle"].forEach(function (p) {
    var d = Object.getOwnPropertyDescriptor(
      CanvasRenderingContext2D.prototype,
      p,
    );
    Object.defineProperty(ctx, p, {
      configurable: true,
      get: function () {
        return d.get.call(this);
      },
      set: function (v) {
        d.set.call(this, conv(v));
      },
    });
  });
  var cg = ctx.createLinearGradient.bind(ctx);
  ctx.createLinearGradient = function () {
    var g = cg.apply(null, arguments);
    var add = g.addColorStop.bind(g);
    g.addColorStop = function (o, c) {
      add(o, conv(c));
    };
    return g;
  };
};

/* ===== PALETA VIVA para o PNG =========================================
   Reproduz o tema dinamico do site num PNG estatico. Funciona pelo mesmo
   mecanismo da paleta clara: um mapa cor->cor. Os tres tons de fundo do
   PNG viram as ancoras laranja/rosa/azul do degrade, entao o gradiente
   que o desenho ja monta passa a ser o "rio" do tema VIVA; e as caixas
   navy chapadas viram branco translucido para o degrade aparecer atras.
   As ancoras ja vem com um veu navy embutido (74%): na tela quem segura
   o contraste e o backdrop-filter, que nao existe num PNG, entao o
   escurecimento precisa estar na propria cor. Com isso o texto branco
   fica >=11:1 e o cinza de apoio >=5:1 em qualquer ponto do degrade. */
window.__aplicarPaletaViva = function (ctx) {
  var MAPA = {
    /* fundo: os tres tons viram as ancoras do degrade VIVA */
    "#0a0f38": "#41151a",
    "#0b1030": "#340f34",
    "#141d3d": "rgba(255,255,255,.10)",
    "#070b2e": "#340f34",
    "#05081f": "#141151",
    /* idem para os fundos proprios do PNG da Mesa de RV */
    "#070809": "#41151a",
    "#0c0e14": "#340f34",
    "#13161d": "#141151",
    /* caixas chapadas -> vidro, para o degrade passar por tras */
    "#111845": "rgba(255,255,255,.10)",
    "#141c57": "rgba(255,255,255,.13)",
    "#10164a": "rgba(255,255,255,.12)",
    "#0a0e3f": "rgba(255,255,255,.08)",
    "#0c1142": "rgba(255,255,255,.09)",
    "#141a57": "rgba(255,255,255,.13)",
    /* vidro um pouco mais forte, ja que o fundo agora tem cor */
    "rgba(255,255,255,.04)": "rgba(255,255,255,.09)",
    "rgba(255,255,255,.05)": "rgba(255,255,255,.10)",
    "rgba(255,255,255,.06)": "rgba(255,255,255,.11)",
    "rgba(255,255,255,.08)": "rgba(255,255,255,.13)",
    "rgba(255,255,255,.10)": "rgba(255,255,255,.15)",
    "rgba(255,255,255,.12)": "rgba(255,255,255,.17)",
    /* linhas e bordas ganham um pouco de forca sobre o fundo colorido */
    "rgba(120,130,210,.10)": "rgba(255,255,255,.12)",
    "rgba(120,130,210,.12)": "rgba(255,255,255,.14)",
    "rgba(120,130,210,.18)": "rgba(255,255,255,.18)",
    "rgba(120,130,210,.22)": "rgba(255,255,255,.22)",
    /* cinza de apoio: sobe para o azul da marca, que le melhor aqui */
    "#a9b0d6": "#B7C4F2",
    "#8089be": "#A3B2E8",
    "#6f77a8": "#94ACEC",
    "#8a92c0": "#A3B2E8",
  };
  function conv(v) {
    if (typeof v !== "string") return v;
    var k = v.trim().toLowerCase().replace(/\s+/g, "");
    return MAPA[k] || v;
  }
  ["fillStyle", "strokeStyle"].forEach(function (pr) {
    var d = Object.getOwnPropertyDescriptor(
      CanvasRenderingContext2D.prototype,
      pr,
    );
    Object.defineProperty(ctx, pr, {
      configurable: true,
      get: function () {
        return d.get.call(this);
      },
      set: function (v) {
        d.set.call(this, conv(v));
      },
    });
  });
  var cg2 = ctx.createLinearGradient.bind(ctx);
  ctx.createLinearGradient = function () {
    var g = cg2.apply(null, arguments);
    var add = g.addColorStop.bind(g);
    g.addColorStop = function (o, c) {
      add(o, conv(c));
    };
    return g;
  };
};

(function () {
  var _gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (tipo) {
    var ctx = _gc.apply(this, arguments);
    try {
      if (ctx && tipo === "2d" && !this.isConnected && !this.__paletaOk) {
        if (window.__hubPngTema === "claro") {
          this.__paletaOk = true;
          window.__aplicarPaletaClara(ctx);
        } else if (window.__hubPngTema === "viva") {
          this.__paletaOk = true;
          window.__aplicarPaletaViva(ctx);
        }
      }
    } catch (e) {}
    return ctx;
  };
})();
(function () {
  var PNG_TEMAS = ["escuro", "claro", "viva"];
  var PNG_ICONE = {
    escuro: "\u{1F319}",
    claro: "\u{1F31E}",
    viva: "\u{1F308}",
  };
  var PNG_NOME = { escuro: "escuro", claro: "claro", viva: "viva" };
  function rot() {
    var t = PNG_NOME[window.__hubPngTema] ? window.__hubPngTema : "escuro";
    var b = document.getElementById("btnPngPaleta");
    if (b)
      b.innerHTML =
        PNG_ICONE[t] + '<span class="rot">PNG ' + PNG_NOME[t] + "</span>";
    var f = document.getElementById("btnPngTema");
    if (f)
      f.textContent =
        PNG_ICONE[t] +
        " PNG: paleta " +
        (t === "viva"
          ? "viva (tema dinâmico)"
          : t === "claro"
            ? "clara"
            : "escura");
  }
  window.__rotularPngTema = rot;
  function ligar() {
    var b = document.getElementById("btnPngPaleta");
    if (!b) return;
    if (b.__wired) return;
    b.__wired = true;
    rot();
    b.addEventListener("click", function () {
      var i = PNG_TEMAS.indexOf(window.__hubPngTema);
      window.__hubPngTema = PNG_TEMAS[(i < 0 ? 0 : i + 1) % PNG_TEMAS.length];
      try {
        window.hubStorage.setItem("hubPngTema", window.__hubPngTema);
      } catch (e) {}
      rot();
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", ligar);
  else ligar();
})();
