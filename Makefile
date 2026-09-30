VENV  := .venv
PY    := $(VENV)/bin/python
PIP   := $(VENV)/bin/pip
STAMP := $(VENV)/.installed
SPEED ?= 5

.PHONY: all setup install run test clean

all: run

$(STAMP): requirements.txt
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	touch $(STAMP)

setup: install

install: $(STAMP)

run: $(STAMP)
	$(PY) main.py --speed $(SPEED)

test: $(STAMP)
	$(PY) -m unittest discover -s tests -t .

clean:
	rm -rf $(VENV) __pycache__ game/__pycache__ tests/__pycache__

DEMO_DIR := docs/demo
PORT ?= 8001

.PHONY: demo contraste

demo:
	@echo "démo sur http://localhost:$(PORT)/  (Ctrl-C pour arrêter)"
	@python3 $(DEMO_DIR)/scripts/serveur.py $(PORT)

contraste:
	python3 $(DEMO_DIR)/scripts/verifie_contraste.py
