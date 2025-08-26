# ArtGallery

*UTILIZE A BRANCH PRINCIPAL (MAIN) PARA EXECUTAR*

Gabrieli Eduarda Lembeck        
Julio Bezerra de Mattos Manoel      
Mileine da Silva de Freitas

### 1. Visão Geral
O ArtGallery é uma plataforma para artistas exporem suas obras digitais, onde usuários podem favoritar, comentar e interagir com os trabalhos.

### 1.1. Funcionalidades Principais
* Funcionalidades para Usuários
* Cadastro e autenticação.
* Exploração de obras organizadas por categorias. Favoritar e comentar nas obras de arte.
* Upload de novas criações para exposição.

### 1.2. Funcionalidades para Administradores
* Dashboard administrativo.
* Cadastro e gerenciamento de obras e artistas. Controle de usuários e permissões.

### 1.3. Adicionais
* Criação de coleções (pastas) para apreciadores e administradores
* Implementação de categorias
* Advertêncoia e banimento
* Liberação de contas do tipo artista somente pelos administradores, com barrramento no login para contas não liberadas
* Recuperação de senha via API com sistema de token temporário para validação

### 2. Bibliotecas necessárias para funcionamento:
``` npm install ```

``` npm install -g express-generator ```

``` npm install -g express ```

``` npm install express-session ```

``` npm install mysql2 ```

``` npm install multer ```

``` npm install nodemailer ```

``` npm install winston @opentelemetry/api @opentelemetry/sdk-node ```

``` npm install -g license-checker ```

*Biblioteca Adicional do Python:*

``` pip install semgrep ``` (Instalar globalmente)

``` semgrep --config auto . ``` (Executar dentro do projeto)

### 3. Banco de dados
* Dump para banco de dados se encontra disponível no caminho: ArtGallery > BackupBD > ArtGallery.sql
* Crie um banco de dados com o nome ``` artg ``` para importar dump 
* Insira os dados descritos nos arquivos: ArtGallery > BackupBD > insert.sql

### 4. Usuario
* Você pode usar um dos usuários pré-cadastrados no insert.sql ou criar seus prórpios usuários. O ideal é testar com um de cada tipo:
    * Artista
    * Apreciador/ usuário comum
    * Administrador

### 5. Administrador
* Para visualizar as páginas de administração, vá para rota:
``` localhost:3001/adm ```
