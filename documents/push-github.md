# Push su GitHub — Lingua AI

## Comando

Apri il terminale Shell di Replit e scrivi:

```bash
bash scripts/push-github.sh
```

## Cosa fa

1. Aggiorna il token di autenticazione nel remote GitHub
2. Pusha il branch `master` su `github.com/liviom53/lingue-AI`
3. Sincronizza tutti i commit locali con il repository remoto

## Quando usarlo

- Dopo aver fatto modifiche importanti al codice
- Prima di condividere il link del repository
- Per tenere GitHub aggiornato con l'ultima versione dell'app

## Note

- Il token viene letto automaticamente dalla variabile d'ambiente `GITHUB_TOKEN`
- Non serve inserire password o credenziali manualmente
- Il repository è: `https://github.com/liviom53/lingue-AI`
