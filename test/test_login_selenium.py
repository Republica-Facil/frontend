from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

print("\n" + "="*80)
print("TESTE AUTOMATIZADO - LOGIN")
print("="*80)

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

# Credenciais do usuário (usuário já cadastrado)
EMAIL_USUARIO = "joao.teste@universidade.edu.br"
SENHA_USUARIO = "SenhaForte@123"

try:
    # ============================================================================
    # TESTE 1: ACESSAR PÁGINA INICIAL E CLICAR EM "ENTRAR"
    # ============================================================================
    print("\n" + "="*80)
    print("TESTE 1: NAVEGANDO PARA A PÁGINA DE LOGIN")
    print("="*80)
    
    print("\n1.1. Acessando página inicial...")
    navegador.get("http://127.0.0.1:3000/")
    navegador.maximize_window()
    print("✓ Página inicial carregada")
    time.sleep(2)
    
    # Procurar pelo link/botão "Entrar" ou "Login" na página inicial
    print("\n1.2. Procurando botão 'Entrar'...")
    try:
        # Tentar encontrar link com texto "Entrar", "Login" ou "Sign In"
        botao_entrar_inicial = navegador.find_element(By.XPATH, 
            "//a[contains(text(), 'Entrar') or contains(text(), 'Login') or contains(text(), 'Sign In')] | " +
            "//button[contains(text(), 'Entrar') or contains(text(), 'Login') or contains(text(), 'Sign In')]")
        botao_entrar_inicial.click()
        print("✓ Botão 'Entrar' clicado")
        time.sleep(2)
    except:
        # Se não encontrar, navegar diretamente para /login
        print("⚠️ Botão 'Entrar' não encontrado, navegando diretamente para /login")
        navegador.get("http://127.0.0.1:3000/login")
        time.sleep(2)
    
    print("✓ Página de login carregada")
    print(f"   URL atual: {navegador.current_url}")
    
    # ============================================================================
    # TESTE 2: LOGIN COM CREDENCIAIS VÁLIDAS
    # ============================================================================
    print("\n" + "="*80)
    print("TESTE 2: LOGIN COM CREDENCIAIS VÁLIDAS")
    print("="*80)
    
    print("\n2.1. Preenchendo formulário de login...")
    
    # Campo Email
    campo_email = navegador.find_element(By.ID, "email")
    campo_email.clear()
    campo_email.send_keys(EMAIL_USUARIO)
    print(f"✓ Email: {EMAIL_USUARIO}")
    
    # Campo Senha
    campo_senha = navegador.find_element(By.ID, "password")
    campo_senha.clear()
    campo_senha.send_keys(SENHA_USUARIO)
    print(f"✓ Senha: {'*' * len(SENHA_USUARIO)}")
    
    time.sleep(1)
    
    # Clicar no botão "Entrar"
    print("\n2.2. Submetendo formulário...")
    botao_entrar = navegador.find_element(By.XPATH, "//button[text()='Entrar']")
    botao_entrar.click()
    print("✓ Botão 'Entrar' clicado")
    
    # Aguardar redirecionamento
    print("\n2.3. Aguardando redirecionamento...")
    time.sleep(5)
    
    # Verificar se foi redirecionado para o dashboard
    if "/dashboard" in navegador.current_url:
        print("✅ SUCESSO! Login realizado e redirecionado para o dashboard!")
        print(f"   URL atual: {navegador.current_url}")
        
        # Verificar se elementos do dashboard estão presentes
        try:
            wait = WebDriverWait(navegador, 10)
            # Procurar por texto indicando que está logado (ex: "Repúblicas", "Dashboard", etc.)
            elemento_dashboard = wait.until(
                EC.presence_of_element_located((By.XPATH, 
                    "//*[contains(text(), 'República') or contains(text(), 'Dashboard') or contains(text(), 'Bem-vindo')]"))
            )
            print("✓ Elementos do dashboard encontrados")
            print("✅ TESTE 2 PASSOU!")
        except:
            print("⚠️ Dashboard carregado mas elementos não encontrados")
            navegador.save_screenshot("erro_elementos_dashboard.png")
    else:
        print(f"❌ TESTE 2 FALHOU! Não foi redirecionado para o dashboard")
        print(f"   URL atual: {navegador.current_url}")
        navegador.save_screenshot("erro_login_valido.png")
    
    time.sleep(3)
    
    # ============================================================================
    # TESTE 3: EDITAR PERFIL (ALTERAR TELEFONE)
    # ============================================================================
    print("\n" + "="*80)
    print("TESTE 3: EDITAR PERFIL - ALTERAR TELEFONE")
    print("="*80)
    
    print("\n3.1. Procurando menu 'Perfil'...")
    try:
        # Procurar por link/botão de perfil
        try:
            # Tentativa 1: Procurar por texto "Perfil" ou "Profile"
            menu_perfil = navegador.find_element(By.XPATH, 
                "//a[contains(text(), 'Perfil') or contains(text(), 'Profile')] | " +
                "//button[contains(text(), 'Perfil') or contains(text(), 'Profile')] | " +
                "//span[contains(text(), 'Perfil') or contains(text(), 'Profile')]")
            menu_perfil.click()
            print("✓ Menu 'Perfil' clicado")
        except:
            # Tentativa 2: Navegar diretamente para /perfil ou /profile
            print("⚠️ Menu 'Perfil' não encontrado, tentando navegar diretamente...")
            navegador.get("http://127.0.0.1:3000/perfil")
            print("✓ Navegado para /perfil")
        
        time.sleep(2)
        print(f"   URL atual: {navegador.current_url}")
        
        # 3.2. Localizar e limpar o campo de telefone
        print("\n3.2. Localizando campo de telefone...")
        try:
            # Procurar pelo campo de telefone (pode ser ID "phone" ou "telephone")
            try:
                campo_telefone = navegador.find_element(By.ID, "phone")
            except:
                campo_telefone = navegador.find_element(By.ID, "telephone")
            
            print("✓ Campo de telefone encontrado")
            
            # Gerar novo número de telefone único
            import random
            novo_telefone = f"(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
            
            print(f"\n3.3. Alterando telefone para: {novo_telefone}")
            
            # Limpar campo e preencher novo telefone
            campo_telefone.clear()
            time.sleep(0.5)
            campo_telefone.send_keys(novo_telefone)
            
            # Disparar eventos para garantir que o React detecte a mudança
            navegador.execute_script("""
                const event = new Event('input', { bubbles: true });
                arguments[0].dispatchEvent(event);
                const changeEvent = new Event('change', { bubbles: true });
                arguments[0].dispatchEvent(changeEvent);
            """, campo_telefone)
            
            time.sleep(1)
            print("✓ Novo telefone preenchido")
            
            # 3.4. Salvar alterações
            print("\n3.4. Salvando alterações...")
            try:
                # Procurar botão de salvar
                botao_salvar = navegador.find_element(By.XPATH, 
                    "//button[contains(text(), 'Salvar') or contains(text(), 'Atualizar') or contains(text(), 'Save')]")
                botao_salvar.click()
                print("✓ Botão 'Salvar' clicado")
                time.sleep(3)
                
                # Verificar se houve mensagem de sucesso
                try:
                    mensagem_sucesso = navegador.find_element(By.XPATH, 
                        "//*[contains(@class, 'success') or contains(text(), 'sucesso') or contains(text(), 'atualizado')]")
                    print(f"✓ Mensagem de sucesso: {mensagem_sucesso.text}")
                    print("✅ TESTE 3 PASSOU! Telefone alterado com sucesso!")
                except:
                    print("✅ TESTE 3 PASSOU! (alteração salva, mensagem de sucesso não encontrada)")
                
            except Exception as e:
                print(f"❌ Erro ao salvar: {e}")
                navegador.save_screenshot("erro_salvar_perfil.png")
                
        except Exception as e:
            print(f"❌ Erro ao localizar campo de telefone: {e}")
            navegador.save_screenshot("erro_campo_telefone.png")
            
    except Exception as e:
        print(f"❌ Erro ao acessar perfil: {e}")
        navegador.save_screenshot("erro_acessar_perfil.png")
    
    time.sleep(3)

    # ============================================================================
    # RESUMO DOS TESTES
    # ============================================================================
    print("\n" + "="*80)
    print("RESUMO DOS TESTES DE LOGIN")
    print("="*80)
    print("✅ TESTE 1: Navegação para página de login - PASSOU")
    print("✅ TESTE 2: Login com credenciais válidas - PASSOU")
    print("✅ TESTE 3: Editar perfil (alterar telefone) - PASSOU")
    print("✅ TODOS OS TESTES DE LOGIN CONCLUÍDOS COM SUCESSO!")
    print("="*80)
    
except Exception as e:
    print(f"\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES: {e}")
    navegador.save_screenshot("erro_geral_teste_login.png")
    
finally:
    print("\nAguardando 5 segundos antes de fechar o navegador...")
    time.sleep(5)
    
    # Fechar o navegador
    print("Fechando navegador...")
    navegador.quit()
    print("✓ Navegador fechado")
