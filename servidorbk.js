const dgram = require('dgram');
const BackupPort = 8081;
const multicastAddress = '239.255.1.100'; // Endereço de multicast para comunicação
const clients = [];

// Estados possíveis do cliente
const ClientState = {
  IDLE: 'IDLE', 
  AWAITING_LENGTH: 'AWAITING_LENGTH', 
  AWAITING_WIDTH: 'AWAITING_WIDTH', 
  AWAITING_RADIUS: 'AWAITING_RADIUS', 
  AWAITING_MASS: 'AWAITING_MASS', 
  AWAITING_SIMPLE: 'AWAITING_SIMPLE',
  AWAITING_SIMPLES_JUR: 'AWAITING_SIMPLES_JUR',
  AWAITING_SIMPLES_TEMP: 'AWAITING_SIMPLES_TEMP',
  AWAITING_COMPOUND: 'AWAITING_COMPOUND',
  AWAITING_COMPOUND_JUR: 'AWAITING_COMPOUND_JUR',
  AWAITING_COMPOUND_TEMP: 'AWAITING_COMPOUND_TEMP',
};

// Função para encontrar cliente pelo ID
const getClientById = (clientId) => {
  return clients.find((client) => client.id === clientId);
};

// Função para processar as requisições recebidas+

const processRequest = (msg, rinfo) => {
  const clientId = rinfo.address + ':' + rinfo.port;
  let client = getClientById(clientId);

  if (!client) {
    client = { id: clientId, currentState: ClientState.IDLE, port: rinfo.port, address: rinfo.address };
    clients.push(client);
  }

  const operacao = msg.toString().trim();

  if (operacao === 'PING') {
    server.send('PONG', rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.log('Erro ao enviar resposta para o cliente:', err);
      }
    });
  } else {
    try {
      switch (client.currentState) {
        case ClientState.IDLE:
          // O cliente está enviando a operação desejada
          switch (operacao) {
            case '1':
              client.currentState = ClientState.AWAITING_LENGTH;
              server.send("Qual o comprimento da casa?", rinfo.port, rinfo.address);
              break;
            case '2':
              client.currentState = ClientState.AWAITING_RADIUS;
              server.send("Qual o raio do círculo?", rinfo.port, rinfo.address);
              break;
            case '3':
              client.currentState = ClientState.AWAITING_MASS;
              server.send("Qual a massa do seu soco?", rinfo.port, rinfo.address);
              break;
            case '4':
              client.currentState = ClientState.AWAITING_SIMPLE;
              server.send("Qual o valor capital? ", rinfo.port, rinfo.address);
              break;
            case '5':
              client.currentState = ClientState.AWAITING_COMPOUND;
              server.send("Qual o valor capital? ", rinfo.port, rinfo.address);
              break;
            default:
              server.send('Operação inválida!', rinfo.port, multicastAddress);
              break;
          }
          break;

        case ClientState.AWAITING_LENGTH:
          // O cliente enviou o comprimento da casa, agora aguardamos a largura
          client.comprimentoCasa = parseFloat(msg);
          client.currentState = ClientState.AWAITING_WIDTH;
          server.send("Qual a largura da casa?", rinfo.port, rinfo.address);
          break;

        case ClientState.AWAITING_WIDTH:
          // O cliente enviou a largura da casa, podemos calcular a área
          const larguraCasa = parseFloat(msg);
          const areaCasa = client.comprimentoCasa * larguraCasa;
          console.log(`Cliente ${clientId} enviou comprimento: ${client.comprimentoCasa}, largura: ${larguraCasa}`);
          server.send(`A área da casa é: ${areaCasa}`, rinfo.port, rinfo.address);
          client.currentState = ClientState.IDLE;
          break;

        case ClientState.AWAITING_RADIUS:
          // O cliente enviou o raio do círculo, podemos calcular a área
          const raioCirculo = parseFloat(msg);
          const areaCirculo = Math.PI * raioCirculo * raioCirculo;
          console.log(`Cliente ${clientId} enviou raio do círculo: ${raioCirculo}`);
          server.send(`A área do círculo é: ${areaCirculo}`, rinfo.port, rinfo.address);
          client.currentState = ClientState.IDLE;
          break;

        case ClientState.AWAITING_MASS:
          // O cliente enviou a massa do soco, podemos calcular o poder do soco
          const massaSoco = parseFloat(msg);
          const poderSoco = massaSoco * Math.pow(299792458, 2);
          console.log(`Cliente ${clientId} enviou massa do soco: ${massaSoco}`);
          server.send(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!`, rinfo.port, rinfo.address);
          client.currentState = ClientState.IDLE;
          break;
        
        case ClientState.AWAITING_SIMPLE:
          client.capital = parseFloat(msg);
          console.log(`Cliente ${clientId} enviou capital do juros simples: ${client.capital}`);
          client.currentState = ClientState.AWAITING_SIMPLES_JUR;
          server.send("Qual a taxa de juros?", rinfo.port, rinfo.address);
          break;
        
        case ClientState.AWAITING_SIMPLES_JUR:
          client.juros = parseFloat(msg);
          console.log(`Cliente ${clientId} enviou juros do juros simples: ${client.juros}`);
          client.currentState = ClientState.AWAITING_SIMPLES_TEMP;
          server.send("Qual o tempo em ano(s)?", rinfo.port, rinfo.address);
          break;
        
        case ClientState.AWAITING_SIMPLES_TEMP:
          const tempo = parseFloat(msg);
          const jurosSimples = ((client.capital * client.juros * tempo) / 100);
          console.log(`Cliente ${clientId} enviou tempo em anos do juros simples: ${tempo}`);
          server.send(`O valor do juros simples é: ${jurosSimples}`, rinfo.port, rinfo.address);
          client.currentState = ClientState.IDLE;
          break;

        case ClientState.AWAITING_COMPOUND:
          client.capital_composto = parseFloat(msg)
          console.log(`Cliente ${clientId} enviou capital do juros composto: ${client.capital_composto}`);
          client.currentState = ClientState.AWAITING_COMPOUND_JUR;
          server.send("Qual a taxa de juros?", rinfo.port, rinfo.address);
          break;
        
        case ClientState.AWAITING_COMPOUND_JUR:
          client.juros_composto = parseFloat(msg)
          console.log(`Cliente ${clientId} enviou juros composto: ${client.juros_composto}`);
          client.currentState = ClientState.AWAITING_COMPOUND_TEMP;
          server.send("Qual o tempo em ano(s)?", rinfo.port, rinfo.address);
          break;

        case ClientState.AWAITING_COMPOUND_TEMP:
          const tempo_composto = parseFloat(msg);
          const jurosComposto = (client.capital_composto * (Math.pow(1 + client.juros_composto / 100, tempo_composto) - 1));
          console.log(`Cliente ${clientId} enviou tempo em anos do juros composto: ${tempo_composto}`);
          server.send(`O valor do juros composto é: ${jurosComposto}`, rinfo.port, rinfo.address);
          client.currentState = ClientState.IDLE;
          break;

        default:
          server.send('Estado inválido!', rinfo.port, rinfo.address);
          break;
      }
    } catch (err) {
      console.error(`Erro ao processar a solicitação do cliente ${clientId}:`, err);
    }
  }
};

const server = dgram.createSocket({ type: 'udp4', reuseAddr: true });

server.on('listening', () => {
  server.addMembership(multicastAddress);
  console.log(`Servidor escutando na porta ${BackupPort} e endereço multicast ${multicastAddress}`);
});

server.on('message', (message, remote) => {
  const data = message.toString().trim();
  const clientId = remote.address + ':' + remote.port;
 // console.log(`Requisição recebida do cliente ${clientId}: ${data}`);
  processRequest(data, remote);
});

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
  server.send('Problemas', 8070, multicastAddress);
});

server.bind(BackupPort);
