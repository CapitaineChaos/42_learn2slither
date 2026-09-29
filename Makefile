PYTHON := .venv/bin/python
PROJECT := /dev/shm/learn2slither
SPEED ?= 5

.PHONY: all setup venv install run test clean

all: run

setup: install

venv:
	python3 -m venv .venv

install: venv
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

run: setup
	mkdir -p $(PROJECT)
	rsync -a --delete main.py game requirements.txt $(PROJECT)/
	cd $(PROJECT) && $(CURDIR)/$(PYTHON) main.py --speed $(SPEED) --models $(CURDIR)/models

test: setup
	$(PYTHON) -m unittest discover -s tests -t .

clean:
	rm -rf .venv $(PROJECT) __pycache__ game/__pycache__
