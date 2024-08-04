# Usar uma imagem base do Python
FROM python:3.11

# Configurar o diretório de trabalho
WORKDIR /app

# Copiar os arquivos de requisitos e instalar dependências
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Copiar o código da aplicação
COPY app.py app.py

# Expor a porta da aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["python", "app.py"]
