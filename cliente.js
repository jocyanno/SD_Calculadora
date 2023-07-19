const net = require('net');
const readline = require('readline');

const serverIP = '127.0.0.1'; // IP do servidor
const serverPort = 8070; // Porta de comunicação

const client = new net.Socket(); // Cria uma instância do objeto Socket
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

client.connect(serverPort, serverIP, function() {
  console.log('Conectado ao servidor.');

  console.log('Escolha uma operação:');
  console.log('1-Area de uma casa');
  console.log('2-Area de um circulo');
  console.log('3-O poder do seu soco no espaço, na velocidade da luz');

  rl.question('Operação: ', function(operacao) {
    client.write(operacao); // Envia a operação para o servidor

    switch (operacao) {
      case '1':
        rl.question('Qual o comprimento da casa? ', function(comprimentoCasa) {
          rl.question('Qual a largura da casa? ', function(larguraCasa) {
            const areaCasa = comprimentoCasa * larguraCasa;
            console.log(`A área da casa é: ${areaCasa}`);
          });
        });
        break;

      case '2':
        rl.question('Qual o raio do círculo? ', function(raioCirculo) {
          const areaCirculo = Math.PI * raioCirculo * raioCirculo;
          console.log(`A área do círculo é: ${areaCirculo}`);
        });
        break;

      case '3':
        rl.question('Qual a massa do seu soco? ', function(massaSoco) {
          const poderSoco = massaSoco * Math.pow(299792458, 2);
          console.log(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!`);
        });
        break;

      default:
        console.log('Operação inválida!');
        break;
    }
  });
});

// client.on('data', function(data) {
//   const resposta = data.toString().trim();
//   console.log('Servidor falou: ' + resposta);
// });

client.on('close', function() {
  console.log('Conexão fechada.');
});
