# Sistema de Reservas de Restaurante

Neste projeto foi construido uma API para gerenciar reservas de mesas em um restaurante. O objetivo é desenvolver funcionalidades comuns em sistemas reais de reserva, incluindo autenticação, validação e controle de disponibilidade. 

## Requisitos do Projeto

### Objetivo Principal
Desenvolver uma API RESTful para:
- Registrar reservas de mesas.
- Controlar o status das reservas e das mesas.
- Bloquear reservas quando a mesa estiver ocupada.

### Stack Recomendado
- **Backend**: Node.js (Fastify).
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)

---

## Funcionalidades

1. **Autenticação de Usuário**
   - **Registro**: O usuário deve ser capaz de se registrar com um nome, e-mail e senha.
   - **Login**: Usuários autenticados recebem um token JWT para acesso às funcionalidades de reservas.
   - **Restrição de Acesso**: Apenas usuários logados podem criar e visualizar reservas.

2. **Gestão de Mesas**
   - **Listagem**: Listar todas as mesas disponíveis no restaurante.
   - **Criar Mesa**: Administradores podem adicionar novas mesas ao sistema com um nome e capacidade de pessoas.
   - **Status da Mesa**: Cada mesa pode estar `disponível`, `reservada` ou `inativa`.

3. **Sistema de Reservas**
   - **Criar Reserva**: Usuários autenticados podem criar reservas para mesas específicas.
   - **Verificar Disponibilidade**: A API deve verificar se a mesa está disponível no horário solicitado antes de confirmar a reserva.
   - **Cancelar Reserva**: Usuários podem cancelar suas reservas, o que libera a mesa para novas reservas.

4. **Controle de Status**
   - **Status das Mesas**: Mesas ficam `reservadas` automaticamente ao serem associadas a uma reserva.
   - **Status das Reservas**: Reservas têm status `ativo` quando confirmadas e `cancelado` quando canceladas.

---

## Estrutura do Banco de Dados

- **User**
    - `id`: Identificador único.
    - `name`: Nome do usuário.
    - `email`: E-mail do usuário (único).
    - `password`: Senha do usuário, armazenada com hash.
    - `role`: Papel do usuário (ex.: `client` ou `admin`).

- **Table**
    - `id`: Identificador único.
    - `tableNumber`: Número da mesa.
    - `capacity`: Quantidade máxima de pessoas que a mesa comporta.
    - `status`: Status atual da mesa (`available`, `reserved`, `inactive`).

- **Reservation**
    - `id`: Identificador único.
    - `userId`: ID do usuário que fez a reserva.
    - `tableId`: ID da mesa reservada.
    - `reservationDate`: Data e horário da reserva.
    - `status`: Status da reserva (`active`, `canceled`).

---

## Endpoints da API

### Autenticação
- `POST /auth/register` — Cadastro de novos usuários.
- `POST /auth/login` — Login de usuários e geração de token JWT.

### Mesas
- `GET /tables` — Lista todas as mesas e seus status.
- `POST /tables` — Adiciona uma nova mesa (apenas administradores).
- `PATCH /tables/:id` — Atualiza informações de uma mesa.
- `DELETE /tables/:id` — Remove uma mesa (apenas administradores).

### Reservas
- `POST /reservations` — Cria uma nova reserva, validando disponibilidade e a capacidade da mesa.
- `GET /reservations` — Lista todas as reservas do usuário autenticado.
- `PATCH /reservations/:id/cancelar` — Cancela uma reserva ativa.

---

## Regras de Negócio

1. **Verificação de Disponibilidade**
   - Antes de criar uma reserva, verifique se a mesa está disponível no horário desejado.

2. **Validação de Capacidade**
   - O sistema deve validar a capacidade da mesa para atender o número de pessoas indicado na reserva.

3. **Cancelamento de Reserva**
   - Quando uma reserva é cancelada, o sistema deve atualizar o status da mesa para `disponível`.

4. **Permissões de Usuário**
   - Apenas administradores podem adicionar, atualizar ou remover mesas.
   - Apenas o usuário que criou uma reserva pode cancelá-la.

---

## Validação de Dados

- **Datas e Horários**: A reserva só pode ser feita para horários futuros dentro do horário de funcionamento do restaurante.
- **Campos Obrigatórios**: Valide a presença de todos os campos obrigatórios em cada endpoint.
- **Formatos**: E-mails e datas devem estar em formatos corretos.

---

## Habilidades desenvolvidas nesse projeto

Esse projeto cobre habilidades importantes para o desenvolvimento backend e simula situações reais de um sistema de reservas, como:

1. **CRUD Completo**: Como construir e organizar uma API com operações básicas (criação, leitura, atualização e exclusão) para recursos, como usuários, mesas e reservas.
2. **Autenticação e Autorização**: Uso de JWT para proteger rotas e controlar permissões de usuários.
3. **Validação de Dados**: Como validar entradas para garantir a integridade das informações, como horário, capacidade e status.
4. **Controle de Disponibilidade**: Gerenciamento de reservas e status para impedir duplicidade de reservas no mesmo horário e mesa.
5. **Modelagem de Banco de Dados**: Estruturar um banco relacional para representar relacionamentos e garantir consistência entre as entidades.
6. **Boas Práticas de API REST**: Aprender padrões e organização de rotas e respostas HTTP para melhorar a qualidade do código e documentação.