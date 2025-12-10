//LOGIN: ADMIN
//SENHA: 12345


import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "segredoaaa",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 }
}));

const equipes = [];
const jogadores = [];


app.get("/", (req, res) => {
  let erro = req.query.erro ? "<p style='color:red;'>Usuário ou senha invalidos!</p>" : "";

  res.send(`
    <h1>Login</h1>

    ${erro}

    <form method="POST" action="/login">
      Usuário: <input name="usuario"><br><br>
      Senha: <input type="password" name="senha"><br><br>
      <button>Entrar</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  const usuario = req.body.usuario;
  const senha = req.body.senha;

  if (!usuario || !senha) {
    return res.redirect("/?erro=1");
  }

  if (usuario === "admin" && senha === "12345") {
    req.session.logado = true;
    req.session.usuario = usuario;
    res.cookie("ultimoAcesso", new Date().toLocaleString());
    return res.redirect("/menu");
  }

  return res.redirect("/?erro=1");
});


app.get("/menu", (req, res) => {
  if (!req.session.logado) return res.redirect("/");

  let ultimo = req.cookies.ultimoAcesso || "Nenhum acesso registrado";

  res.send(`
    <h1>Menu Principal</h1>
    <p>Bem-vindo! | <a href="/logout">Logout</a></p>
    <p><b>Último acesso:</b> ${ultimo}</p>
    <hr>

    <a href="/cadastro-equipe">Cadastro de Equipes</a><br><br>
    <a href="/cadastro-jogador">Cadastro de Jogadores</a><br><br>
  `);
});


app.get("/cadastro-equipe", (req, res) => {
  if (!req.session.logado) return res.redirect("/");

  res.send(`
    <h1>Cadastro de Equipe</h1>
    <a href="/menu">Voltar ao Menu</a><br><br>

    <form method="POST">
      Nome da equipe: <input name="nome"><br><br>
      Capitão: <input name="capitao"><br><br>
      Telefone/WhatsApp: <input name="telefone"><br><br>

      <button>Cadastrar</button>
    </form>

    <h2>Equipes já cadastradas:</h2>
    <ul>
      ${equipes.map(e => `<li>${e.nome} - Capitão: ${e.capitao}</li>`).join("")}
    </ul>
  `);
});

app.post("/cadastro-equipe", (req, res) => {
  const { nome, capitao, telefone } = req.body;

  if (!nome || !capitao || !telefone) {
    return res.send(`
      <h1>Cadastro de Equipe</h1>
      <p style="color:red;">Todos os campos são obrigatórios</p>
      <a href="/cadastro-equipe">Voltar</a>
    `);
  }

  equipes.push({ nome, capitao, telefone });
  res.redirect("/cadastro-equipe");
});


app.get("/cadastro-jogador", (req, res) => {
  if (!req.session.logado) return res.redirect("/");

  let opcoes = equipes
    .map(eq => `<option value="${eq.nome}">${eq.nome}</option>`)
    .join("");

  res.send(`
    <h1>Cadastro de Jogador</h1>
    <a href="/menu">Voltar ao Menu</a><br><br>

    <form method="POST">
      Nome do jogador: <input name="nome"><br><br>
      Nickname: <input name="nick"><br><br>

      Função:
      <select name="funcao">
        <option value="">Escolha</option>
        <option value="top">Top</option>
        <option value="jungle">Jungle</option>
        <option value="mid">Mid</option>
        <option value="adc">Atirador (ADC)</option>
        <option value="suporte">Suporte</option>
      </select><br><br>

      Elo: <input name="elo"><br><br>
      Gênero: <input name="genero"><br><br>

      Equipe:
      <select name="equipe">
        <option value="">Selecione</option>
        ${opcoes}
      </select><br><br>

      <button>Cadastrar</button>
    </form>

    <h2>Jogadores cadastrados:</h2>
    ${listarJogadores()}
  `);
});

app.post("/cadastro-jogador", (req, res) => {
  const { nome, nick, funcao, elo, genero, equipe } = req.body;

  if (!nome || !nick || !funcao || !elo || !genero || !equipe) {
    return res.send(`
      <h1>Cadastro de Jogador</h1>
      <p style="color:red;">Todos os campos são obrigatórios</p>
      <a href="/cadastro-jogador">Voltar</a>
    `);
  }

  jogadores.push({ nome, nick, funcao, elo, genero, equipe });
  res.redirect("/cadastro-jogador");
});

function listarJogadores() {
  let html = "";

  equipes.forEach(eq => {
    html += `<h3>${eq.nome}</h3><ul>`;
    jogadores
      .filter(j => j.equipe === eq.nome)
      .forEach(j => {
        html += `<li>${j.nome} (${j.nick}) - ${j.funcao} - ${j.elo}</li>`;
      });
    html += "</ul>";
  });

  return html;
}


app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("ultimoAcesso");
    res.send(`
      <h1>Logout realizado!</h1>
      <a href="/">Voltar ao Login</a>
    `);
  });
});

app.listen(port, () => {
  console.log("Rodando em http://localhost:" + port);
});
