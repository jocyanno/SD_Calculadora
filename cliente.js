const net = require('net');
const readline = require('readline');

const serverIP = '127.0.0.1'; 
const serverPort = 8070;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayOperations() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
}

function performLocalCalculation(operacao) {
  switch (operacao) {
    case '1':
      rl.question('Qual o comprimento da casa? ', function (comprimentoCasa) {
        rl.question('Qual a largura da casa? ', function (larguraCasa) {
          const areaCasa = comprimentoCasa * larguraCasa;
          console.log(`A área da casa é: ${areaCasa}`);
        });
      });
      break;

    case '2':
      rl.question('Qual o raio do círculo? ', function (raioCirculo) {
        const areaCirculo = Math.PI * raioCirculo * raioCirculo;
        console.log(`A área do círculo é: ${areaCirculo}`);
      });
      break;

    case '3':
      rl.question('Qual a massa do seu soco? ', function (massaSoco) {
        const poderSoco = massaSoco * Math.pow(299792458, 2);
        console.log(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!`);
      });
      break;

    default:
      console.log('Operação inválida!');
      break;
  }
}

const client = new net.Socket();

client.connect(serverPort, serverIP, function () {
  console.log('Conectado ao servidor.');
  displayOperations();

  rl.on('line', function (operacao) {
    client.write(operacao);
  });

  client.on('data', function (data) {
    console.log('Resposta do servidor:', data.toString().trim());
  });

  client.on('close', function () {
    console.log("Caiu a conexão com o servidor!")
    displayOperations();

  rl.on('line', function (operacao) {
    performLocalCalculation(operacao);
  });// Encerra o cliente caso a conexão seja fechada.
  });
});

client.on('error', function (err) {
  console.log(`Deu erro no cliente ${err}`);
});
