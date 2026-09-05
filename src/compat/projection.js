/* ===== Projecao de carteira (juros compostos + aporte mensal) — Montar a Carteira e RV ===== */
(function () {
  function fmtBR(n) {
    n = Math.round(Number(n) || 0);
    try {
      return n.toLocaleString("pt-BR");
    } catch (e) {
      return String(n);
    }
  }
  function pn(v) {
    var t = String(v == null ? "" : v)
      .trim()
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^0-9.\-]/g, "");
    var n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }

  /* Juros compostos, aporte no FIM de cada mes.
     Taxa anual i -> mensal equivalente im=(1+i)^(1/12)-1 (NAO i/12, que superestima). */
  function projetar(P, taxaAA, aporte, anos) {
    var i = (Number(taxaAA) || 0) / 100,
      im = Math.pow(1 + i, 1 / 12) - 1,
      out = [];
    P = Number(P) || 0;
    aporte = Number(aporte) || 0;
    for (var a = 1; a <= anos; a++) {
      var m = a * 12,
        f = Math.pow(1 + im, m);
      var saldo =
        P * f + (Math.abs(im) > 1e-9 ? aporte * ((f - 1) / im) : aporte * m);
      var aportado = P + aporte * m;
      out.push({
        ano: a,
        aportado: aportado,
        saldo: saldo,
        juros: saldo - aportado,
      });
    }
    return out;
  }
  window.__hubProjCalc = projetar;

  function campo(lbl, id, val) {
    return (
      '<div style="flex:1 1 200px"><div style="font-size:10.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#8A93D8;margin-bottom:5px">' +
      lbl +
      "</div>" +
      '<input id="' +
      id +
      '" type="text" inputmode="decimal" value="' +
      val +
      '" style="width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(120,130,210,.3);border-radius:9px;color:#fff;font-family:Sora,sans-serif;font-weight:700;font-size:15px;padding:9px 11px;outline:none"></div>'
    );
  }

  /* ===== Documento branded (mesmo espirito da peca do Propor) ===== */
  function docHTML(P, T, A, anos, cliente) {
    var l = projetar(P, T, A, anos),
      fim = l[l.length - 1] || { saldo: 0, aportado: 0, juros: 0 };
    var hoje = new Date().toLocaleDateString("pt-BR");
    var maxv = Math.max(P, fim.saldo, 1);
    var bars =
      '<div style="display:flex;align-items:flex-end;gap:10px;height:180px;margin:6px 0 4px">';
    var pts = [{ lb: "Hoje", v: P }].concat(
      l.map(function (x) {
        return { lb: "Ano " + x.ano, v: x.saldo };
      }),
    );
    pts.forEach(function (p) {
      var hgt = Math.max(6, Math.round((p.v / maxv) * 150));
      bars +=
        '<div style="flex:1;text-align:center">' +
        '<div style="font-size:11px;font-weight:700;color:#0B1033;margin-bottom:4px">R$ ' +
        fmtBR(p.v) +
        "</div>" +
        '<div style="height:' +
        hgt +
        'px;background:#F26522;border-radius:5px 5px 0 0"></div>' +
        '<div style="font-size:11px;font-weight:700;color:#5b6485;margin-top:5px">' +
        p.lb +
        "</div></div>";
    });
    bars += "</div>";
    function cd(k, v, col) {
      return (
        '<div style="flex:1;background:#f5f7fb;border:1px solid #e3e7f0;border-radius:10px;padding:13px 15px">' +
        '<div style="font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#5b6485">' +
        k +
        "</div>" +
        '<div style="font-family:Sora,sans-serif;font-weight:800;font-size:21px;color:' +
        (col || "#0B1033") +
        ';margin-top:3px">' +
        v +
        "</div></div>"
      );
    }
    var rows = "";
    l.forEach(function (x) {
      rows +=
        '<tr style="border-bottom:1px solid #eef1f6">' +
        '<td style="padding:10px 14px;font-weight:800;color:#0B1033">Ano ' +
        x.ano +
        "</td>" +
        '<td style="padding:10px 14px;text-align:right;color:#5b6485">R$ ' +
        fmtBR(x.aportado) +
        "</td>" +
        '<td style="padding:10px 14px;text-align:right;color:#c07a00;font-weight:700">R$ ' +
        fmtBR(x.juros) +
        "</td>" +
        '<td style="padding:10px 14px;text-align:right;font-family:Sora,sans-serif;font-weight:800;color:#0a7a45">R$ ' +
        fmtBR(x.saldo) +
        "</td></tr>";
    });
    return (
      '<div style="width:794px;background:#fff;font-family:Manrope,Arial,sans-serif;color:#0B1033">' +
      '<div style="background:#0B1033;padding:22px 26px 18px">' +
      '<div style="font-family:Sora,sans-serif;font-weight:800;font-size:30px;color:#F26522;line-height:1">rico</div>' +
      '<div style="font-family:Sora,sans-serif;font-weight:800;font-size:19px;color:#fff;margin-top:6px">Projeção da Carteira</div>' +
      '<div style="font-size:12.5px;color:#aab1d6;margin-top:9px">Cliente: <b style="color:#fff">' +
      (cliente || "cliente") +
      '</b> &nbsp;&nbsp; Patrimônio: <b style="color:#fff">R$ ' +
      fmtBR(P) +
      '</b> &nbsp;&nbsp; Aporte mensal: <b style="color:#fff">R$ ' +
      fmtBR(A) +
      '</b> &nbsp;&nbsp; Data: <b style="color:#fff">' +
      hoje +
      "</b></div>" +
      "</div>" +
      '<div style="height:4px;background:#F26522"></div>' +
      '<div style="padding:22px 26px 26px">' +
      '<div style="display:flex;gap:12px;margin-bottom:22px">' +
      cd("Investido total", "R$ " + fmtBR(fim.aportado)) +
      cd("Juros acumulados", "R$ " + fmtBR(fim.juros), "#c07a00") +
      cd("Projeção em " + anos + " anos", "R$ " + fmtBR(fim.saldo), "#0a7a45") +
      "</div>" +
      '<div style="font-family:Sora,sans-serif;font-weight:800;font-size:13px;letter-spacing:.6px;text-transform:uppercase;color:#0B1033;margin-bottom:8px">Evolução projetada</div>' +
      bars +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px">' +
      '<thead><tr style="background:#0B1033;color:#fff">' +
      '<th style="text-align:left;padding:10px 14px;font-size:11px;letter-spacing:.6px">PERÍODO</th>' +
      '<th style="text-align:right;padding:10px 14px;font-size:11px;letter-spacing:.6px">INVESTIDO</th>' +
      '<th style="text-align:right;padding:10px 14px;font-size:11px;letter-spacing:.6px">JUROS</th>' +
      '<th style="text-align:right;padding:10px 14px;font-size:11px;letter-spacing:.6px">VALOR PROJETADO</th>' +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table>" +
      '<div style="font-size:10.5px;color:#8a90ab;line-height:1.6;margin-top:18px;border-top:1px solid #eef1f6;padding-top:12px">' +
      "Projeção ilustrativa com <b>juros compostos</b> (taxa anual convertida para mensal equivalente) e aporte no fim de cada mês, com base no retorno estimado de <b>" +
      String(T).replace(".", ",") +
      "% a.a.</b> da carteira. Não considera impostos, custos nem volatilidade. " +
      "<b>Rentabilidade estimada não garante resultados futuros.</b> Material de apoio comercial — não constitui recomendação ou oferta." +
      "</div>" +
      "</div></div>"
    );
  }
  function docPreview(P, T, A, anos, cliente) {
    var inner = docHTML(P, T, A, anos, cliente);
    function go(h2c) {
      if (!h2c) return;
      var cont = document.createElement("div");
      cont.style.cssText =
        "position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1";
      cont.innerHTML = inner;
      document.body.appendChild(cont);
      setTimeout(function () {
        h2c(cont, {
          scale: 2,
          backgroundColor: "#fff",
          logging: false,
          windowWidth: 794,
          width: 794,
        })
          .then(function (cv) {
            try {
              document.body.removeChild(cont);
            } catch (_) {}
            mostrar(cv);
          })
          .catch(function () {
            try {
              document.body.removeChild(cont);
            } catch (_) {}
          });
      }, 60);
    }
    function mostrar(cv) {
      var old = document.getElementById("hubProjPng");
      if (old) {
        try {
          old.remove();
        } catch (_) {}
      }
      var w = document.createElement("div");
      w.id = "hubProjPng";
      w.style.cssText =
        "position:fixed;inset:0;z-index:5400;background:rgba(5,8,31,.9);display:flex;align-items:center;justify-content:center;padding:22px;";
      var bx = document.createElement("div");
      bx.style.cssText =
        "background:#0B1033;border:1px solid rgba(120,130,210,.3);border-radius:16px;padding:14px;max-width:94vw;max-height:94vh;display:flex;flex-direction:column;gap:11px;";
      var hd = document.createElement("div");
      hd.style.cssText =
        "display:flex;align-items:center;justify-content:space-between;gap:14px;color:#fff;font-family:Sora,sans-serif;font-weight:800;font-size:15px;";
      hd.innerHTML = "<span>Projeção da Carteira</span>";
      var bs = document.createElement("div");
      bs.style.cssText = "display:flex;gap:8px;";
      function mk(t, p) {
        var b = document.createElement("button");
        b.textContent = t;
        b.style.cssText =
          "font-family:inherit;font-weight:700;font-size:13px;border-radius:9px;padding:8px 14px;cursor:pointer;" +
          (p
            ? "background:#F26522;border:none;color:#fff;"
            : "background:transparent;border:1px solid rgba(120,130,210,.42);color:#cfd4ef;");
        return b;
      }
      var bC = mk("Copiar imagem", true),
        bD = mk("Baixar PNG", false),
        bX = mk("Fechar", false);
      bs.appendChild(bC);
      bs.appendChild(bD);
      bs.appendChild(bX);
      hd.appendChild(bs);
      var sc2 = document.createElement("div");
      sc2.style.cssText = "overflow:auto;border-radius:10px;background:#fff;";
      cv.style.cssText = "display:block;max-width:100%;height:auto;";
      sc2.appendChild(cv);
      bx.appendChild(hd);
      bx.appendChild(sc2);
      w.appendChild(bx);
      document.body.appendChild(w);
      function cl() {
        try {
          w.remove();
        } catch (_) {}
      }
      bX.onclick = cl;
      w.onclick = function (e) {
        if (e.target === w) cl();
      };
      bD.onclick = function () {
        try {
          var a = document.createElement("a");
          a.download = "Projecao.png";
          a.href = cv.toDataURL("image/png");
          a.click();
        } catch (_) {}
      };
      bC.onclick = function () {
        cv.toBlob(function (blob) {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(function () {
                bC.textContent = "Copiado!";
                setTimeout(function () {
                  bC.textContent = "Copiar imagem";
                }, 1600);
              })
              .catch(function () {
                bC.textContent = "Use Baixar PNG";
                setTimeout(function () {
                  bC.textContent = "Copiar imagem";
                }, 2200);
              });
          } else {
            bC.textContent = "Use Baixar PNG";
            setTimeout(function () {
              bC.textContent = "Copiar imagem";
            }, 2200);
          }
        }, "image/png");
      };
    }
    if (window.html2canvas) {
      go(window.html2canvas);
      return;
    }
    var sc = document.createElement("script");
    sc.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    sc.onload = function () {
      go(window.html2canvas);
    };
    sc.onerror = function () {
      go(null);
    };
    document.head.appendChild(sc);
  }

  window.__hubProjecao = function (cfg) {
    cfg = cfg || {};
    var old = document.getElementById("hubProjModal");
    if (old) {
      try {
        old.remove();
      } catch (_) {}
    }
    var m = document.createElement("div");
    m.id = "hubProjModal";
    m.style.cssText =
      "position:fixed;inset:0;z-index:5200;background:rgba(5,8,31,.88);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow:auto;";
    var box = document.createElement("div");
    box.style.cssText =
      "background:#0B1033;border:1px solid rgba(120,130,210,.3);border-radius:16px;padding:18px;max-width:860px;width:100%;color:#fff;font-family:Manrope,sans-serif;";
    var anos = [1, 2, 3, 5, 10, 15, 20, 30],
      sel = 5;
    box.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:6px;flex-wrap:wrap">' +
      '<div style="font-family:Sora,sans-serif;font-weight:800;font-size:18px">Projeção da carteira' +
      (cfg.cliente
        ? ' &middot; <span style="color:#9AA2D0;font-size:14px">' +
          String(cfg.cliente) +
          "</span>"
        : "") +
      "</div>" +
      '<div style="display:flex;gap:8px">' +
      '<button id="hpCopy" style="background:#F26522;border:none;color:#fff;font-weight:700;font-size:13px;border-radius:9px;padding:8px 14px;cursor:pointer;font-family:inherit">Gerar documento</button>' +
      '<button id="hpClose" style="background:transparent;border:1px solid rgba(120,130,210,.42);color:#9AA2D0;font-weight:700;font-size:13px;border-radius:9px;padding:8px 14px;cursor:pointer;font-family:inherit">Fechar</button>' +
      "</div>" +
      "</div>" +
      '<div style="font-size:11.5px;color:#8A93D8;margin-bottom:14px">Juros compostos, aporte no fim de cada mês. Taxa anual convertida para mensal equivalente.</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
      campo("Patrimônio inicial (R$)", "hpP", fmtBR(cfg.patrimonio)) +
      campo(
        "Retorno estimado (% a.a.)",
        "hpT",
        String(Math.round((Number(cfg.taxaAA) || 0) * 10) / 10).replace(
          ".",
          ",",
        ),
      ) +
      campo("Aporte mensal (R$)", "hpA", "0") +
      "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px">' +
      '<div id="hpAnos" style="display:flex;gap:8px;flex-wrap:wrap"></div>' +
      '<span style="display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(120,130,210,.3);border-radius:9px;padding:3px 8px 3px 11px">' +
      '<input id="hpAnoCustom" type="number" min="1" max="60" step="1" placeholder="outro" style="width:54px;background:transparent;border:none;outline:none;color:#fff;font-family:inherit;font-weight:700;font-size:13px"/>' +
      '<span style="font-size:12px;color:#8A93D8">anos</span>' +
      "</span>" +
      "</div>" +
      '<div id="hpOut"></div>';
    m.appendChild(box);
    document.body.appendChild(m);

    function btnAno(a) {
      return (
        '<button data-ano="' +
        a +
        '" style="font-family:inherit;font-weight:700;font-size:13px;border-radius:9px;padding:7px 15px;cursor:pointer;' +
        (a === sel
          ? "background:rgba(242,101,34,.18);border:1px solid rgba(242,101,34,.55);color:#fff;"
          : "background:transparent;border:1px solid rgba(120,130,210,.3);color:#cfd4ef;") +
        '">' +
        a +
        " anos</button>"
      );
    }
    function render() {
      document.getElementById("hpAnos").innerHTML = anos.map(btnAno).join("");
      Array.prototype.forEach.call(
        box.querySelectorAll("[data-ano]"),
        function (b) {
          b.onclick = function () {
            sel = +b.getAttribute("data-ano");
            render();
          };
        },
      );
      var P = pn(document.getElementById("hpP").value);
      var T = pn(document.getElementById("hpT").value);
      var A = pn(document.getElementById("hpA").value);
      var linhas = projetar(P, T, A, sel);
      var fim = linhas[linhas.length - 1] || {
        saldo: 0,
        aportado: 0,
        juros: 0,
      };
      var h =
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
        card("Investido total", "R$ " + fmtBR(fim.aportado), "#cfd4ef") +
        card("Juros acumulados", "R$ " + fmtBR(fim.juros), "#FFB020") +
        card("Saldo em " + sel + " anos", "R$ " + fmtBR(fim.saldo), "#3DD68C") +
        "</div>";
      h +=
        '<div style="border:1px solid rgba(120,130,210,.2);border-radius:12px;overflow:hidden">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
        '<thead><tr style="background:rgba(255,255,255,.04);color:#8A93D8;font-size:11px;text-transform:uppercase;letter-spacing:.5px">' +
        '<th style="text-align:left;padding:9px 12px">Ano</th><th style="text-align:right;padding:9px 12px">Investido</th>' +
        '<th style="text-align:right;padding:9px 12px">Juros</th><th style="text-align:right;padding:9px 12px">Saldo projetado</th></tr></thead><tbody>';
      linhas.forEach(function (l) {
        h +=
          '<tr style="border-top:1px solid rgba(120,130,210,.14)">' +
          '<td style="padding:9px 12px;font-weight:700">' +
          l.ano +
          "</td>" +
          '<td style="padding:9px 12px;text-align:right;color:#cfd4ef">R$ ' +
          fmtBR(l.aportado) +
          "</td>" +
          '<td style="padding:9px 12px;text-align:right;color:#FFB020">R$ ' +
          fmtBR(l.juros) +
          "</td>" +
          '<td style="padding:9px 12px;text-align:right;font-family:Sora,sans-serif;font-weight:800;color:#3DD68C">R$ ' +
          fmtBR(l.saldo) +
          "</td></tr>";
      });
      h +=
        "</tbody></table></div>" +
        '<div style="font-size:10.5px;color:#7E87BE;margin-top:10px;line-height:1.5">Projeção estimada com base no retorno da carteira. <b>Não é garantia de retorno futuro</b>; rentabilidade passada não garante resultados futuros.</div>';
      document.getElementById("hpOut").innerHTML = h;
    }
    function card(k, v, col) {
      return (
        '<div style="flex:1 1 180px;background:rgba(255,255,255,.04);border:1px solid rgba(120,130,210,.2);border-radius:12px;padding:11px 14px">' +
        '<div style="font-size:10.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#8A93D8">' +
        k +
        "</div>" +
        '<div style="font-family:Sora,sans-serif;font-weight:800;font-size:19px;color:' +
        col +
        ';margin-top:3px">' +
        v +
        "</div></div>"
      );
    }
    ["hpP", "hpT", "hpA"].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) e.onchange = render;
    });
    var _hpc = document.getElementById("hpAnoCustom");
    if (_hpc) {
      _hpc.onchange = function () {
        var v = Math.max(1, Math.min(60, Math.round(pn(_hpc.value) || 0)));
        if (v) {
          sel = v;
          render();
        }
      };
      _hpc.onkeydown = function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          _hpc.blur();
        }
      };
    }
    document.getElementById("hpClose").onclick = function () {
      try {
        m.remove();
      } catch (_) {}
    };
    m.onclick = function (e) {
      if (e.target === m) {
        try {
          m.remove();
        } catch (_) {}
      }
    };
    document.getElementById("hpCopy").onclick = function () {
      var P = pn(document.getElementById("hpP").value);
      var T = pn(document.getElementById("hpT").value);
      var A = pn(document.getElementById("hpA").value);
      docPreview(P, T, A, sel, cfg.cliente || "");
    };
    render();
  };

  /* Botoes: Montar a Carteira e Renda Variavel */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest ? ev.target.closest("#btnProj,#rvBtnProj") : null;
    if (!t) return;
    ev.preventDefault();
    var c = (window.RICO_BRIDGE && window.RICO_BRIDGE.carteira) || {};
    if (t.id === "rvBtnProj") {
      var rv =
        typeof window.__rvProjData === "function" ? window.__rvProjData() : {};
      window.__hubProjecao({
        patrimonio: rv.patrimonio || c.patrimonio || 0,
        taxaAA: c.retAA || 12,
        cliente: rv.cliente || c.cliente || "",
      });
    } else {
      window.__hubProjecao({
        patrimonio: c.patrimonio || 0,
        taxaAA: c.retAA || 0,
        cliente: c.cliente || "",
      });
    }
  });
})();
