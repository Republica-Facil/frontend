# API de Usuários - Referência

## Endpoints Necessários

### 1. GET /users/{user_id}
**Descrição**: Retorna os dados do usuário pelo ID (extraído do token JWT)

**Headers**:
```
Authorization: Bearer {access_token}
```

**URL Params**:
- `user_id`: ID do usuário (extraído do campo `id` do token JWT no frontend)

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "fullname": "João Silva",
  "email": "joao@email.com",
  "telephone": "(11) 99999-9999"
}
```

**Erros**:
- `401 Unauthorized`: Token inválido ou expirado
- `403 Forbidden`: Tentativa de acessar dados de outro usuário
- `404 Not Found`: Usuário não encontrado

---

### 2. PUT /users/{user_id}
**Descrição**: Atualiza os dados do usuário

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body** (UserSchema):
```json
{
  "fullname": "João Silva Santos",
  "email": "joao.novo@email.com",
  "telephone": "(11) 98888-8888"
}
```

**Validações**:
- `fullname`: String obrigatória
- `email`: Email válido obrigatório (EmailStr)
- `telephone`: String obrigatória

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "fullname": "João Silva Santos",
  "email": "joao.novo@email.com",
  "telephone": "(11) 98888-8888",
  "message": "Usuário atualizado com sucesso"
}
```

**Erros**:
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido ou usuário não autorizado
- `404 Not Found`: Usuário não encontrado
- `409 Conflict`: Email já cadastrado para outro usuário

---

## Observações Importantes

1. **User ID do Token**: O frontend extrai o `user_id` do token JWT (campo `id` do payload) e usa para buscar e atualizar os dados do usuário.

2. **Estrutura do Token JWT**: O token contém:
   - `id`: ID do usuário (usado para GET e PUT)
   - `sub`: Email do usuário (subject)
   - `exp`: Timestamp de expiração

3. **Dados sem Senha**: A atualização do perfil NÃO inclui alteração de senha. Apenas nome, email e telefone são atualizados.

4. **Validação de Email**: O backend deve verificar se o novo email já não está sendo usado por outro usuário.

5. **Autorização**: O usuário só pode atualizar seus próprios dados (verificar se o `user_id` da URL corresponde ao ID do usuário autenticado extraído do token).

4. **Token JWT Payload Atual**:
```json
{
  "sub": "joao@email.com",  // Email do usuário
  "id": 1,                  // ID do usuário (usado para GET e PUT)
  "exp": 1730000000         // Timestamp de expiração
}
```

5. **Criação do Token no Backend**:
```python
def create_access_token(
    data: dict, user_id: int = None, expires_delta_minutes: int = None
):
    to_encode = data.copy()

    if user_id is not None:
        to_encode.update({'id': user_id})  # ID incluído no token
    
    # ... resto do código
```

## Como o Frontend Extrai os Dados do Token

```javascript
const getUserDataFromToken = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return null

  try {
    // JWT tem 3 partes separadas por ponto: header.payload.signature
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))
    
    return {
      userId: decodedPayload.id,        // ID do usuário
      email: decodedPayload.sub || decodedPayload.email
    }
  } catch (err) {
    console.error('Erro ao decodificar token:', err)
    return null
  }
}

// Uso no formulário de perfil:
const tokenData = getUserDataFromToken()
const response = await api.get(`/users/${tokenData.userId}`)

// Ao salvar (sem senha):
const dataToSend = {
  fullname: formData.fullname,
  email: formData.email,
  telephone: formData.telephone
}
await api.put(`/users/${tokenData.userId}`, dataToSend)
```

## Exemplo de Implementação Backend (FastAPI)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

router = APIRouter()

class UserSchema(BaseModel):
    fullname: str
    email: EmailStr
    telephone: str

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    current_user = Depends(get_current_user)
):
    """Retorna dados do usuário pelo ID"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verificar se o usuário está consultando seus próprios dados
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode acessar seus próprios dados"
        )
    
    return {
        "id": user.id,
        "fullname": user.fullname,
        "email": user.email,
        "telephone": user.telephone
    }

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserSchema,
    current_user = Depends(get_current_user)
):
    """Atualiza dados do usuário"""
    # Verificar se o usuário está tentando atualizar seus próprios dados
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode atualizar seus próprios dados"
        )
    
    # Verificar se email já existe (exceto o próprio usuário)
    existing_user = db.query(User).filter(
        User.email == user_data.email,
        User.id != user_id
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado"
        )
    
    # Atualizar dados (sem alterar senha)
    current_user.fullname = user_data.fullname
    current_user.email = user_data.email
    current_user.telephone = user_data.telephone
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "fullname": current_user.fullname,
        "email": current_user.email,
        "telephone": current_user.telephone,
        "message": "Usuário atualizado com sucesso"
    }
```
