import { useState, useEffect } from 'react'
import api from '../services/api'

export function useRepublicas() {
  const [republicas, setRepublicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Buscar todas as repúblicas
  const fetchRepublicas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/republicas')
      setRepublicas(response.data)
    } catch (err) {
      console.error('Erro ao buscar repúblicas:', err)
      setError(err.response?.data?.detail || 'Erro ao carregar repúblicas')
      setRepublicas([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar uma república específica por ID
  const fetchRepublica = async (republicaId) => {
    try {
      const response = await api.get(`/republicas/${republicaId}`)
      return response.data
    } catch (err) {
      console.error('Erro ao buscar república:', err)
      throw err
    }
  }

  // Adicionar nova república
  const addRepublica = (novaRepublica) => {
    setRepublicas(prev => [...prev, novaRepublica])
  }

  // Atualizar república existente
  const updateRepublica = (republicaId, dadosAtualizados) => {
    setRepublicas(prev => 
      prev.map(rep => rep.id === republicaId ? { ...rep, ...dadosAtualizados } : rep)
    )
  }

  // Remover república
  const removeRepublica = (republicaId) => {
    setRepublicas(prev => prev.filter(rep => rep.id !== republicaId))
  }

  // Carregar repúblicas ao montar o componente
  useEffect(() => {
    fetchRepublicas()
  }, [])

  return {
    republicas,
    loading,
    error,
    fetchRepublicas,
    fetchRepublica,
    addRepublica,
    updateRepublica,
    removeRepublica
  }
}
