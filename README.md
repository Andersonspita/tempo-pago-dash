# Sistema de Controle de Horas - CRT Gerenciador

## Informações do Projeto

**URL**: https://lovable.dev/projects/4da6ec3a-8f11-4e2c-92db-95115475bdbf

## Sobre o Sistema

Este é um sistema completo para controle de horas de trabalho e gerenciamento de pagamentos, desenvolvido para facilitar o acompanhamento de tarefas diárias, cálculo de horas trabalhadas e controle de valores pagos/pendentes.

### Funcionalidades Principais

- ✅ **Dashboard Intuitivo**: Visão geral das estatísticas e atividades recentes
- ✅ **Controle de Horas**: Registro de entrada, saída e cálculo automático de horas
- ✅ **Gestão de Pagamentos**: Controle de valores pagos e pendentes
- ✅ **Exportação de Dados**: Geração de planilhas CSV para relatórios
- ✅ **Tema Dark/Light**: Interface adaptável com alternância de temas
- ✅ **Armazenamento Local**: Dados persistidos no navegador
- ✅ **Interface Responsiva**: Funciona perfeitamente em desktop e mobile

### Campos do Sistema

- **Data**: Data da tarefa executada
- **Hora Inicial**: Horário de início do trabalho
- **Hora Final**: Horário de término do trabalho
- **Horas Trabalhadas**: Cálculo automático do tempo total
- **Descrição**: Detalhamento da tarefa realizada
- **Valor por Hora**: Definição do valor/hora para cálculos
- **Status de Pagamento**: Controle se foi pago ou está pendente

## Como editar este código?

Existem várias maneiras de editar sua aplicação.

**Usar o Lovable**

Simplesmente visite o [Projeto Lovable](https://lovable.dev/projects/4da6ec3a-8f11-4e2c-92db-95115475bdbf) e comece a fazer prompts.

As mudanças feitas via Lovable serão commitadas automaticamente neste repositório.

**Usar seu IDE preferido**

Se você quiser trabalhar localmente usando seu próprio IDE, pode clonar este repo e fazer push das mudanças. As mudanças enviadas também serão refletidas no Lovable.

O único requisito é ter Node.js e npm instalados - [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <SUA_URL_GIT>

# Passo 2: Navegue para o diretório do projeto.
cd <NOME_DO_SEU_PROJETO>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reload e preview instantâneo.
npm run dev
```

**Editar um arquivo diretamente no GitHub**

- Navegue para o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e commit as mudanças.

**Usar GitHub Codespaces**

- Navegue para a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente Codespace.
- Edite arquivos diretamente no Codespace e faça commit e push das suas mudanças quando terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto foi construído com:

- **Vite** - Ferramenta de build rápida
- **TypeScript** - JavaScript tipado para maior segurança
- **React** - Biblioteca para interfaces de usuário
- **shadcn-ui** - Componentes de UI modernos e acessíveis
- **Tailwind CSS** - Framework CSS utilitário
- **date-fns** - Biblioteca para manipulação de datas
- **Lucide React** - Ícones SVG modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas TypeScript

## Como posso fazer deploy deste projeto?

Simplesmente abra o [Lovable](https://lovable.dev/projects/4da6ec3a-8f11-4e2c-92db-95115475bdbf) e clique em Share -> Publish.

## Posso conectar um domínio customizado ao meu projeto Lovable?

Sim, você pode!

Para conectar um domínio, navegue para Project > Settings > Domains e clique em Connect Domain.

Leia mais aqui: [Configurando um domínio customizado](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base do shadcn-ui
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── TimeEntryForm.tsx # Formulário de entrada
│   ├── TimeEntryList.tsx # Lista de registros
│   └── Settings.tsx    # Configurações
├── hooks/              # Hooks customizados
│   └── useTimesheet.ts # Lógica principal do sistema
├── types/              # Definições TypeScript
│   └── timesheet.ts   # Tipos do sistema
└── pages/              # Páginas da aplicação
    └── Index.tsx      # Página principal
```

## Contribuindo

Este projeto está em constante evolução. Sugestões e melhorias são sempre bem-vindas!
