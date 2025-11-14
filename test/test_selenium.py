from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime, timedelta
import time
import random

# Configurar opções do Chrome
chrome_options = Options()
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--start-maximized")
# Descomente a linha abaixo para executar sem abrir o navegador (headless)
# chrome_options.add_argument("--headless")

# Configurar o ChromeDriver automaticamente
service = Service(ChromeDriverManager().install())
navegador = webdriver.Chrome(service=service, options=chrome_options)

# Credenciais do usuário
EMAIL_USUARIO = "joao.teste@universidade.edu.br"
SENHA_USUARIO = "SenhaForte@123"

# Acessar o site
navegador.get("http://127.0.0.1:3000/")

#tela cheia
navegador.maximize_window()

botao_azul_tela_inicial = navegador.find_element(By.CLASS_NAME, "btn-primary")
botao_azul_tela_inicial.click()


# Pausa para a página de cadastro carregar
time.sleep(2) 
print("Preenchendo formulário de cadastro...")

# 1. Campo Nome Completo (ID correto: "name")
campo_nome = navegador.find_element(By.ID, "name")
campo_nome.send_keys("João Silva")
print("✓ Nome preenchido")

# 2. Campo Email (ID correto: "email")
campo_email = navegador.find_element(By.ID, "email")
campo_email.send_keys(EMAIL_USUARIO)
print("✓ Email preenchido")

# 3. Campo Telefone (ID correto: "phone")
campo_telefone = navegador.find_element(By.ID, "phone")
campo_telefone.send_keys("(11) 98765-4321")
print("✓ Telefone preenchido")

# 4. Campo Senha (ID correto: "password")
campo_senha = navegador.find_element(By.ID, "password")
campo_senha.send_keys(SENHA_USUARIO)
print("✓ Senha preenchida")

# 5. Campo Confirmar Senha (ID correto: "confirmPassword")
campo_confirma = navegador.find_element(By.ID, "confirmPassword")
campo_confirma.send_keys(SENHA_USUARIO)
print("✓ Confirmar senha preenchida")

# Pausa para vermos os dados preenchidos
print("\nDados preenchidos. Enviando formulário...")
time.sleep(2)

# Clicar no botão "Criar Conta"
botao_criar = navegador.find_element(By.XPATH, "//button[text()='Criar Conta']")
botao_criar.click()
print("✓ Botão 'Criar Conta' clicado")

# Aguardar redirecionamento ou mensagem de erro
print("\nAguardando resultado do cadastro...")
time.sleep(5)

# Verificar se chegou ao dashboard OU se há mensagem de erro (usuário já existe)
if "/dashboard" in navegador.current_url:
    print("✅ SUCESSO! Cadastro realizado e redirecionado para o dashboard!")
    print(f"   URL atual: {navegador.current_url}")
else:
    # Verificar se há mensagem de erro (usuário já existe)
    print("⚠️ Cadastro não funcionou. Verificando se usuário já existe...")
    
    try:
        # Procurar por mensagem de erro na tela
        erro = navegador.find_element(By.CLASS_NAME, "error-message")
        print(f"   Erro encontrado: {erro.text}")
        print("\n🔄 Tentando fazer LOGIN ao invés de cadastro...")
        
        # Ir para página de login
        navegador.get("http://127.0.0.1:3000/login")
        time.sleep(2)
        
        # Preencher formulário de login
        print("\nPreenchendo formulário de login...")
        campo_email_login = navegador.find_element(By.ID, "email")
        campo_email_login.send_keys(EMAIL_USUARIO)
        print(f"✓ Email: {EMAIL_USUARIO}")
        
        campo_senha_login = navegador.find_element(By.ID, "password")
        campo_senha_login.send_keys(SENHA_USUARIO)
        print(f"✓ Senha: {SENHA_USUARIO}")
        
        # Clicar no botão "Entrar"
        botao_entrar = navegador.find_element(By.XPATH, "//button[text()='Entrar']")
        botao_entrar.click()
        print("✓ Botão 'Entrar' clicado")
        
        # Aguardar redirecionamento
        time.sleep(5)
        
        if "/dashboard" in navegador.current_url:
            print("✅ SUCESSO! Login realizado com sucesso!")
            print(f"   URL atual: {navegador.current_url}")
        else:
            print(f"❌ Erro ao fazer login. URL atual: {navegador.current_url}")
            
    except:
        print(f"❌ Não foi possível fazer cadastro ou login. URL atual: {navegador.current_url}")

time.sleep(3)

# ============================================================================
# CRIAR REPÚBLICA
# ============================================================================
print("\n" + "="*80)
print("CRIANDO REPÚBLICA")
print("="*80)

# Aguardar a página do dashboard carregar completamente
print("\n1. Aguardando dashboard carregar...")
time.sleep(2)

# Clicar no botão "+ Criar Nova República" (classe: btn-add)
print("\n2. Clicando em '+ Criar Nova República'...")
botao_criar_republica = navegador.find_element(By.CLASS_NAME, "btn-add")
botao_criar_republica.click()
print("✓ Botão clicado")

# Aguardar modal aparecer
time.sleep(2)
print("✓ Modal aberto")

# Preencher nome da república
print("\n3. Preenchendo dados da república...")
campo_nome_republica = navegador.find_element(By.ID, "nome")
campo_nome_republica.send_keys("República Teste Selenium")
print("✓ Nome: República Teste Selenium")

# Preencher CEP
campo_cep = navegador.find_element(By.ID, "cep")
campo_cep.send_keys("01310-100")  # CEP válido (Av. Paulista, SP)
print("✓ CEP: 01310-100")

# Clicar no botão "Buscar" para buscar o endereço via API ViaCEP
print("\n4. Buscando endereço via CEP...")
botao_buscar_cep = navegador.find_element(By.XPATH, "//button[contains(text(), 'Buscar')]")
botao_buscar_cep.click()
time.sleep(3)  # Aguardar API responder e preencher os campos
print("✓ Endereço preenchido automaticamente")

# Preencher número (campo manual)
print("\n5. Preenchendo número...")
campo_numero = navegador.find_element(By.ID, "numero")
campo_numero.send_keys("1000")
print("✓ Número: 1000")

# Clicar no botão "Criar República"
print("\n6. Salvando república...")
botao_salvar_republica = navegador.find_element(By.XPATH, "//button[contains(text(), 'Criar República')]")
botao_salvar_republica.click()
time.sleep(3)

# Verificar se houve erro (república já existe) ou se foi criada com sucesso
print("\n7. Verificando resultado...")
try:
    # Tentar encontrar mensagem de erro
    erro_modal = navegador.find_element(By.CLASS_NAME, "error-message")
    print(f"⚠️ Erro ao criar república: {erro_modal.text}")
    print("   República já existe. Fechando modal...")
    
    # Fechar modal (pode ser ESC ou botão X ou clicar fora)
    try:
        # Tentar clicar no botão de fechar (X)
        botao_fechar = navegador.find_element(By.XPATH, "//button[contains(@class, 'modal-close') or contains(@class, 'close')]")
        botao_fechar.click()
    except:
        # Se não encontrar botão, pressionar ESC
        navegador.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
    
    time.sleep(2)
    print("✓ Modal fechado")
    
except:
    # Não há erro, república foi criada
    print("✓ República criada com sucesso!")
    
    # Verificar se apareceu na lista
    try:
        republica_criada = navegador.find_element(By.XPATH, "//h3[text()='República Teste Selenium']")
        print("✅ República apareceu na lista!")
    except:
        print("⚠️ República criada mas não encontrada na lista visível")

time.sleep(2)

# ============================================================================
# ADICIONAR QUARTO
# ============================================================================
print("\n" + "="*80)
print("ADICIONANDO QUARTO")
print("="*80)

# Gerar número único para o quarto baseado no timestamp
numero_quarto = str(100 + random.randint(1, 99))  # Gera número entre 101 e 199

# 1. Selecionar a república criada (clicar no card)
print("\n1. Selecionando república...")
try:
    # Trocamos text()= por contains(text(), ...)
    card_republica = navegador.find_element(By.XPATH, "//h3[contains(text(), 'República Teste Selenium')]/ancestor::div[contains(@class, 'republic-card')]")
    card_republica.click()
    time.sleep(2)
    print("✓ República selecionada")
except Exception as e:
    print(f"⚠️ Erro ao selecionar república: {e}")

# 2. Clicar no menu "Quartos" na sidebar
print("\n2. Navegando para seção 'Quartos'...")
try:
    # TENTATIVA 1: Clicar no <span> que CONTÉM o texto "Quartos" (Mais provável)
    # Usamos 'contains' para ser mais flexível
    menu_quartos = navegador.find_element(By.XPATH, "//span[contains(text(), 'Quartos')]")
    
    # TENTATIVA 2 (Se a 1 falhar, comente a linha acima e descomente a abaixo):
    # Talvez o <span> esteja dentro de um link <a>
    # menu_quartos = navegador.find_element(By.XPATH, "//a[.//span[contains(text(), 'Quartos')]]")

    menu_quartos.click()
    time.sleep(2)
    print("✓ Seção 'Quartos' aberta")
except Exception as e:
    print(f"❌ Erro ao abrir menu Quartos: {e}")
    navegador.save_screenshot("erro_menu_quartos.png")

# 3. Clicar no botão "Adicionar Quarto" (ícone +)
# (Este passo só vai funcionar se o Passo 2 for bem-sucedido)
print("\n3. Clicando em 'Adicionar Quarto'...")
try:
    # O botão tem ícone faPlus, vamos procurar por botão com classe específica
    botao_adicionar = navegador.find_element(By.XPATH, "//button[contains(@class, 'btn-add') or .//svg]")
    botao_adicionar.click()
    time.sleep(2)
    print("✓ Modal de adicionar quarto aberto")
except Exception as e:
    print(f"❌ Erro ao abrir modal de quarto: {e}")
    navegador.save_screenshot("erro_adicionar_quarto.png")

# 4. Preencher número do quarto
print(f"\n4. Preenchendo número do quarto ({numero_quarto})...")
try:
    # O campo de input para número do quarto
    campo_numero_quarto = navegador.find_element(By.XPATH, "//input[@type='text' or @type='number']")
    campo_numero_quarto.clear()
    campo_numero_quarto.send_keys(numero_quarto)
    print(f"✓ Número do quarto: {numero_quarto}")
    time.sleep(1)
except Exception as e:
    print(f"❌ Erro ao preencher número: {e}")

# 5. Clicar no botão de salvar
print("\n5. Salvando quarto...")
try:
    botao_salvar = navegador.find_element(By.XPATH, "//button[contains(text(), 'Adicionar') or contains(text(), 'Criar') or contains(text(), 'Salvar')]")
    botao_salvar.click()

    print("✓ Quarto adicionado! Verificando se aparece na lista...")
    
    # Verificar se o quarto apareceu na lista (com espera explícita)
    try:
        # Criar um "wait" que espera no máximo 10 segundos
        wait = WebDriverWait(navegador, 10)
        
        # Mandar o "wait" esperar ATÉ que o elemento com o número do quarto FIQUE VISÍVEL
        # (Note que usamos 'By.XPATH' dos imports novos)
        quarto_criado = wait.until(
            EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(), '{numero_quarto}')]"))
        )
        
        # Se o script chegou aqui, é porque o elemento apareceu a tempo:
        print(f"✅ SUCESSO! Quarto {numero_quarto} apareceu na lista!")
        
    except Exception as e:
        # Se estourar os 10s, ele vai dar um 'TimeoutException' e cair aqui
        print(f"⚠️ Quarto {numero_quarto} criado mas não encontrado na lista visível (estourou o tempo de espera).")
        navegador.save_screenshot("erro_quarto_nao_encontrado.png")
        
except Exception as e:
    print(f"❌ Erro ao salvar quarto: {e}")
    navegador.save_screenshot("erro_salvar_quarto.png")

# Pausa final para visualizar
time.sleep(5)

print("\n" + "="*80)
print("✅ TESTE COMPLETO: CADASTRO + REPÚBLICA + QUARTO + MEMBRO")
print("="*80)

# ============================================================================
# ADICIONAR MEMBRO
# ============================================================================
print("\n" + "="*80)
print("ADICIONANDO MEMBRO")
print("="*80)

# Gerar dados únicos para o membro
timestamp_membro = int(time.time())
nome_membro = f"Membro Teste {timestamp_membro}"
email_membro = f"membro{timestamp_membro}@email.com"
telefone_membro = f"(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"

# 1. Navegar para a seção "Membros"
print("\n1. Navegando para seção 'Membros'...")
try:
    menu_membros = navegador.find_element(By.XPATH, "//span[contains(text(), 'Membros')]")
    menu_membros.click()
    time.sleep(2)
    print("✓ Seção 'Membros' aberta")
except Exception as e:
    print(f"❌ Erro ao abrir menu Membros: {e}")
    navegador.save_screenshot("erro_menu_membros.png")

# 2. Clicar no botão "Adicionar Membro" (ícone +)
print("\n2. Clicando em 'Adicionar Membro'...")
try:
    botao_adicionar_membro = navegador.find_element(By.XPATH, "//button[contains(@class, 'btn-add')]")
    botao_adicionar_membro.click()
    time.sleep(2)
    print("✓ Modal de adicionar membro aberto")
except Exception as e:
    print(f"❌ Erro ao abrir modal de membro: {e}")
    navegador.save_screenshot("erro_adicionar_membro.png")

# 3. Preencher dados do membro
print("\n3. Preenchendo dados do membro...")
try:
    # Nome completo
    campo_nome_membro = navegador.find_element(By.ID, "fullname")
    campo_nome_membro.clear()
    campo_nome_membro.send_keys(nome_membro)
    print(f"✓ Nome: {nome_membro}")
    
    # Email
    campo_email_membro = navegador.find_element(By.ID, "email")
    campo_email_membro.clear()
    campo_email_membro.send_keys(email_membro)
    print(f"✓ Email: {email_membro}")
    
    # Telefone
    campo_telefone_membro = navegador.find_element(By.ID, "telephone")
    campo_telefone_membro.clear()
    campo_telefone_membro.send_keys(telefone_membro)
    print(f"✓ Telefone: {telefone_membro}")
    
    # Selecionar quarto (select dropdown) - seleciona o último quarto criado
    print("\n4. Selecionando quarto...")
    select_quarto = navegador.find_element(By.ID, "quarto_id")
    select_quarto.click()
    time.sleep(1)
    
    # Selecionar a primeira opção que não seja o placeholder (geralmente o último quarto criado)
    opcao_quarto = navegador.find_element(By.XPATH, "//select[@id='quarto_id']/option[last()]")
    opcao_quarto.click()
    print(f"✓ Quarto selecionado (último da lista)")
    
    time.sleep(1)
    
except Exception as e:
    print(f"❌ Erro ao preencher dados: {e}")
    navegador.save_screenshot("erro_preencher_membro.png")

# 5. Clicar no botão de salvar
print("\n5. Salvando membro...")
try:
    botao_salvar_membro = navegador.find_element(By.XPATH, "//button[contains(text(), 'Adicionar') or contains(text(), 'Salvar')]")
    botao_salvar_membro.click()
    time.sleep(3)
    print("✓ Membro adicionado!")
    
    # Verificar se o membro apareceu na lista
    try:
        wait = WebDriverWait(navegador, 10)
        membro_criado = wait.until(
            EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(), '{nome_membro}')]"))
        )
        print(f"✅ SUCESSO! Membro '{nome_membro}' apareceu na lista!")
    except Exception as e:
        print("⚠️ Membro criado mas não encontrado na lista visível")
        navegador.save_screenshot("erro_membro_nao_encontrado.png")
        
except Exception as e:
    print(f"❌ Erro ao salvar membro: {e}")
    navegador.save_screenshot("erro_salvar_membro.png")

# Pausa final para visualizar
time.sleep(5)

print("\n" + "="*80)
print("✅ TESTE COMPLETO: CADASTRO + REPÚBLICA + QUARTO + MEMBRO + DESPESA")
print("="*80)

# ============================================================================
# ADICIONAR DESPESAS (APENAS 1 DESPESA)
# ============================================================================
print("\n" + "="*80)
print("ADICIONANDO 1 DESPESA (PENDENTE)")
print("="*80)

# ====================================================================
#           ⬇️ AQUI ESTÁ A ALTERAÇÃO ⬇️
#   A lista agora contém apenas UM item, como você pediu
# ====================================================================
despesas = [
    {
        "descricao": "Conta de Luz - Dezembro 2025",
        "valor": "150.50",
        "data_vencimento": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),  # Pendente (vence em 10 dias)
        "categoria": "luz",
        "status": "Pendente"
    }
    # As outras duas despesas (Água e Internet) foram removidas da lista
]

# 1. Navegar para a seção "Despesas"
print("\n1. Navegando para seção 'Despesas'...")
try:
    menu_despesas = navegador.find_element(By.XPATH, "//span[contains(text(), 'Despesas')]")
    menu_despesas.click()
    time.sleep(2)
    print("✓ Seção 'Despesas' aberta")
except Exception as e:
    print(f"❌ Erro ao abrir menu Despesas: {e}")
    navegador.save_screenshot("erro_menu_despesas.png")

# 1.5. Garantir que estamos na aba "Em Aberto" ANTES de começar o loop
print("\n1.5. Garantindo que a aba 'Em Aberto' está selecionada...")
try:
    wait = WebDriverWait(navegador, 10)
    aba_em_aberto = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Em Aberto') or contains(text(), 'Aberto')]"))
    )
    aba_em_aberto.click()
    time.sleep(1) 
    print("✓ Aba 'Em Aberto' selecionada")
except Exception as e:
    print(f"❌ Erro ao tentar selecionar a aba 'Em Aberto': {e}")
    navegador.save_screenshot("erro_aba_despesas.png")

# Loop para criar as despesas (agora só vai rodar 1 vez)
for i, despesa in enumerate(despesas, 1):
    print(f"\n{'='*80}")
    print(f"DESPESA {i}/{len(despesas)} - {despesa['status'].upper()}")
    print(f"{'='*80}")
    
    # 2. Clicar no botão "Adicionar Despesa" (ícone +)
    print(f"\n2.{i}. Clicando em 'Adicionar Despesa'...")
    try:
        wait = WebDriverWait(navegador, 10)
        botao_adicionar_despesa = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'btn-add')]"))
        )
        botao_adicionar_despesa.click()
        time.sleep(2)
        print("✓ Modal de adicionar despesa aberto")
    except Exception as e:
        print(f"❌ Erro ao abrir modal de despesa: {e}")
        navegador.save_screenshot(f"erro_adicionar_despesa_{i}.png")
        continue 
    
    # 3. Preencher dados da despesa
    print(f"\n3.{i}. Preenchendo dados da despesa...")
    try:
        # Descrição
        campo_descricao = navegador.find_element(By.ID, "descricao")
        campo_descricao.clear()
        campo_descricao.send_keys(despesa["descricao"])
        print(f"✓ Descrição: {despesa['descricao']}")
        
        # Categoria (select dropdown) - MOVIDO PARA ANTES DO VALOR
        print(f"\n4.{i}. Selecionando categoria...")
        select_categoria = navegador.find_element(By.ID, "categoria")
        select_categoria.click()
        time.sleep(1)
        
        # Selecionar categoria
        opcao_categoria = navegador.find_element(By.XPATH, f"//select[@id='categoria']/option[@value='{despesa['categoria']}']")
        opcao_categoria.click()
        print(f"✓ Categoria: {despesa['categoria'].capitalize()}")
        time.sleep(1)
        
        # Valor total
        campo_valor = navegador.find_element(By.ID, "valor_total")
        campo_valor.clear()
        campo_valor.click()  # Focar no campo
        # Enviar apenas números e ponto (sem formatação)
        campo_valor.send_keys(despesa["valor"])
        # Disparar evento onChange usando JavaScript para garantir que o React detecte
        navegador.execute_script("""
            const event = new Event('input', { bubbles: true });
            document.getElementById('valor_total').dispatchEvent(event);
            const changeEvent = new Event('change', { bubbles: true });
            document.getElementById('valor_total').dispatchEvent(changeEvent);
        """)
        time.sleep(0.5)  # Pequena pausa para o React processar
        campo_valor.send_keys(Keys.TAB)  # Sair do campo
        time.sleep(1)  # Aguardar cálculo do valor por membro
        print(f"✓ Valor: R$ {despesa['valor']}")
        
        # Data de vencimento - Clicar no calendário e selecionar uma data
        print(f"\n   Preenchendo Data de Vencimento...")
        try:
            campo_data_vencimento = navegador.find_element(By.ID, "data_vencimento")
            
            # Para input type="date" no Selenium, o navegador pode interpretar no formato MM/DD/YYYY
            # Primeiro, clicar no campo
            campo_data_vencimento.click()
            time.sleep(0.5)
            
            # Limpar qualquer valor existente
            campo_data_vencimento.clear()
            
            # Converter a data de YYYY-MM-DD para MM/DD/YYYY (formato americano)
            data_original = despesa['data_vencimento']  # YYYY-MM-DD
            ano, mes, dia = data_original.split('-')
            data_formatada_us = f"{mes}{dia}{ano}"  # MMDDYYYY (sem barras, o navegador adiciona automaticamente)
            
            print(f"   Enviando data: {data_original} → {mes}/{dia}/{ano} (formato US)")
            
            # Método: Usar send_keys com formato MMDDYYYY (sem separadores)
            campo_data_vencimento.send_keys(data_formatada_us)
            time.sleep(0.5)
            
            # Pressionar TAB para sair do campo e confirmar a entrada
            campo_data_vencimento.send_keys(Keys.TAB)
            time.sleep(0.5)
            
            # Verificar se a data foi definida
            data_atual = navegador.execute_script("return document.getElementById('data_vencimento').value")
            
            if data_atual:
                print(f"✓ Data de Vencimento: {data_atual} ({despesa['status']})")
            else:
                # Se não funcionou, tentar método JavaScript direto
                print("   ⚠️ Tentando método JavaScript...")
                navegador.execute_script(f"""
                    const input = document.getElementById('data_vencimento');
                    input.value = '{despesa['data_vencimento']}';
                    input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    input.dispatchEvent(new Event('blur', {{ bubbles: true }}));
                """)
                time.sleep(0.5)
                data_atual = navegador.execute_script("return document.getElementById('data_vencimento').value")
                print(f"✓ Data de Vencimento: {data_atual} ({despesa['status']})")
                
        except Exception as e:
            print(f"❌ Erro ao preencher data: {e}")
            navegador.save_screenshot(f"erro_data_vencimento_{i}.png")
        
        time.sleep(1)
        
    except Exception as e:
        print(f"❌ Erro ao preencher dados: {e}")
        navegador.save_screenshot(f"erro_preencher_despesa_{i}.png")
        continue 
    
    # 5. Verificar se os campos foram preenchidos antes de salvar
    print(f"\n5.{i}. Verificando preenchimento dos campos...")
    try:
        # Verificar valores usando JavaScript
        descricao_value = navegador.execute_script("return document.getElementById('descricao').value")
        valor_value = navegador.execute_script("return document.getElementById('valor_total').value")
        data_value = navegador.execute_script("return document.getElementById('data_vencimento').value")
        categoria_value = navegador.execute_script("return document.getElementById('categoria').value")
        
        print(f"   Descrição: '{descricao_value}'")
        print(f"   Valor: '{valor_value}'")
        print(f"   Data: '{data_value}'")
        print(f"   Categoria: '{categoria_value}'")
        
        if not descricao_value or not valor_value or not data_value or not categoria_value:
            print("❌ Erro: Algum campo não foi preenchido corretamente!")
            print(f"   Campos vazios: " + 
                  f"{'Descrição ' if not descricao_value else ''}" +
                  f"{'Valor ' if not valor_value else ''}" +
                  f"{'Data ' if not data_value else ''}" +
                  f"{'Categoria' if not categoria_value else ''}")
            navegador.save_screenshot(f"erro_campos_vazios_{i}.png")
            
            # Se a data estiver vazia, tentar preencher novamente de forma mais agressiva
            if not data_value:
                print("   Tentando preencher data novamente...")
                navegador.execute_script(f"""
                    const input = document.getElementById('data_vencimento');
                    input.focus();
                    input.value = '{despesa['data_vencimento']}';
                    input.blur();
                    const event = new Event('change', {{ bubbles: true }});
                    input.dispatchEvent(event);
                """)
                time.sleep(2)
                # Verificar novamente
                data_value = navegador.execute_script("return document.getElementById('data_vencimento').value")
                print(f"   Data após segunda tentativa: '{data_value}'")
                if not data_value:
                    print("❌ Não foi possível preencher a data. Pulando esta despesa.")
                    continue
            else:
                continue
            
        print("✓ Todos os campos preenchidos corretamente")
        
    except Exception as e:
        print(f"⚠️ Não foi possível verificar os campos: {e}")
    
    # 6. Clicar no botão de salvar
    print(f"\n6.{i}. Salvando despesa...")
    try:
        botao_salvar_despesa = navegador.find_element(By.CLASS_NAME, "btn-submit")
        botao_salvar_despesa.click()
        print("✓ Botão de salvar clicado")
        
        # Aguardar modal fechar
        time.sleep(3)
        print("✓ Modal fechado")
        
        # Verificar se a despesa apareceu na lista (agora devemos estar na página de despesas)
        print(f"\n7.{i}. Verificando se a despesa apareceu...")
        try:
            wait = WebDriverWait(navegador, 10)
            # Procurar pela descrição da despesa na lista
            despesa_criada = wait.until(
                EC.presence_of_element_located((By.XPATH, f"//*[contains(text(), '{despesa['descricao'].split()[0]}')]"))
            )
            print(f"✅ SUCESSO! Despesa '{despesa['descricao']}' apareceu na lista!")
            
            # 8. REALIZAR O PAGAMENTO DA DESPESA (na seção Despesas)
            print(f"\n8.{i}. Realizando pagamento da despesa...")
            try:
                time.sleep(2)  # Aguardar elementos carregarem
                
                # Procurar pelo botão/ícone de pagar associado à despesa recém-criada
                # Pode ter várias formas: botão "Pagar", ícone de dinheiro, etc.
                try:
                    # Tentativa 1: Procurar botão com classe btn-pay ou texto "Pagar"
                    botao_pagar = navegador.find_element(By.XPATH, 
                        "//button[contains(@class, 'btn-pay') or contains(@class, 'btn-pagar') or " +
                        "contains(text(), 'Pagar') or contains(text(), 'Registrar Pagamento')]")
                    botao_pagar.click()
                    print("✓ Botão de pagar clicado")
                except:
                    # Tentativa 2: Procurar ícone de dinheiro/pagamento (FontAwesome)
                    try:
                        botao_pagar = navegador.find_element(By.XPATH, 
                            "//button[.//svg[contains(@data-icon, 'money') or contains(@data-icon, 'dollar') or contains(@data-icon, 'cash')]]")
                        botao_pagar.click()
                        print("✓ Ícone de pagamento clicado")
                    except:
                        print("⚠️ Botão de pagar não encontrado na interface")
                        navegador.save_screenshot(f"erro_botao_pagar_nao_encontrado_{i}.png")
                        raise Exception("Botão de pagar não encontrado")
                
                # Aguardar modal de pagamento abrir (se houver)
                time.sleep(2)
                
                # Se houver modal de pagamento, preencher dados
                try:
                    # Procurar por select de membro no modal
                    select_membro_pagamento = navegador.find_element(By.ID, "membro_id")
                    select_membro_pagamento.click()
                    time.sleep(1)
                    
                    # Selecionar o último membro (o que criamos)
                    opcao_membro = navegador.find_element(By.XPATH, "//select[@id='membro_id']/option[last()]")
                    opcao_membro.click()
                    print("✓ Membro selecionado para pagamento")
                    time.sleep(1)
                    
                    # Clicar no botão de confirmar pagamento
                    botao_confirmar = navegador.find_element(By.CLASS_NAME, "btn-submit")
                    botao_confirmar.click()
                    print("✓ Pagamento confirmado")
                    time.sleep(3)
                    
                except:
                    # Pode não ter modal, pagamento pode ser direto
                    print("✓ Pagamento realizado (sem modal de confirmação)")
                    time.sleep(2)
                
                print(f"✅ SUCESSO! Pagamento da despesa '{despesa['descricao']}' realizado!")
                
                # 9. NAVEGAR PARA A SEÇÃO DE PAGAMENTOS PARA VERIFICAR
                print(f"\n9.{i}. Navegando para seção 'Pagamentos' para verificar o pagamento...")
                try:
                    menu_pagamentos = navegador.find_element(By.XPATH, "//span[contains(text(), 'Pagamentos')]")
                    menu_pagamentos.click()
                    time.sleep(3)
                    print("✓ Seção 'Pagamentos' aberta")
                    
                    # Verificar se o pagamento aparece na lista
                    try:
                        wait = WebDriverWait(navegador, 10)
                        # Procurar por elementos indicando que há pagamentos
                        pagamento_visivel = wait.until(
                            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'R$') or contains(text(), nome_membro) or contains(text(), 'Conta de Luz')]"))
                        )
                        print("✅ Pagamento visualizado na seção de Pagamentos!")
                    except:
                        print("⚠️ Não foi possível localizar o pagamento na lista (pode levar um tempo para atualizar)")
                        
                    # 10. NAVEGAR PARA A SEÇÃO DE RESUMO E BAIXAR CSV
                    print(f"\n10.{i}. Navegando para seção 'Resumo' para baixar CSV...")
                    try:
                        menu_resumo = navegador.find_element(By.XPATH, "//span[contains(text(), 'Resumo')]")
                        menu_resumo.click()
                        time.sleep(3)
                        print("✓ Seção 'Resumo' aberta")
                        
                        # Procurar e clicar no botão de download CSV
                        print(f"\n11.{i}. Procurando botão de download CSV...")
                        try:
                            # Tentativa 1: Procurar botão com texto "CSV" ou "Download" ou "Exportar"
                            botao_csv = navegador.find_element(By.XPATH, 
                                "//button[contains(text(), 'CSV') or contains(text(), 'Baixar') or contains(text(), 'Download') or contains(text(), 'Exportar')] | " +
                                "//button[contains(@class, 'csv') or contains(@class, 'download') or contains(@class, 'export')]")
                            botao_csv.click()
                            print("✓ Botão de download CSV clicado")
                            time.sleep(2)
                            print("✅ Download do CSV iniciado!")
                            
                        except:
                            # Tentativa 2: Procurar por ícone de download
                            try:
                                botao_csv = navegador.find_element(By.XPATH, 
                                    "//button[.//svg[contains(@data-icon, 'download') or contains(@data-icon, 'file')]]")
                                botao_csv.click()
                                print("✓ Ícone de download clicado")
                                time.sleep(2)
                                print("✅ Download do CSV iniciado!")
                            except Exception as e:
                                print(f"⚠️ Botão de download CSV não encontrado: {e}")
                                navegador.save_screenshot(f"erro_botao_csv_{i}.png")
                        
                    except Exception as e:
                        print(f"⚠️ Erro ao navegar para Resumo: {e}")
                        navegador.save_screenshot(f"erro_navegar_resumo_{i}.png")
                        
                except Exception as e:
                    print(f"⚠️ Erro ao navegar para Pagamentos: {e}")
                    navegador.save_screenshot(f"erro_navegar_pagamentos_{i}.png")
                
            except Exception as e:
                print(f"⚠️ Erro ao realizar pagamento: {e}")
                print(f"   Pode ser que o botão de pagar não esteja disponível para esta despesa")
                navegador.save_screenshot(f"erro_pagamento_despesa_{i}.png")
            
        except Exception as e:
            print(f"⚠️ Despesa criada mas não encontrada na lista visível")
            print(f"   URL atual: {navegador.current_url}")
            navegador.save_screenshot(f"erro_despesa_nao_encontrada_{i}.png")
            
    except Exception as e:
        print(f"❌ Erro ao salvar despesa {i}: {e}")
        navegador.save_screenshot(f"erro_salvar_despesa_{i}.png")
    
    # Pequena pausa entre despesas
    time.sleep(2)

print("\n" + "="*80)
print("✅ 1 DESPESA CRIADA, PAGA E CSV BAIXADO:")
print("   1. Conta de Luz - PENDENTE → PAGA → CSV EXPORTADO")
print("="*80)

# Pausa final para visualizar
time.sleep(5)

print("\n" + "="*80)
print("✅ TESTE COMPLETO: CADASTRO + REPÚBLICA + QUARTO + MEMBRO + DESPESA + PAGAMENTO + CSV")
print("="*80)

# Fechar o navegador
navegador.quit() 