FROM python:3.10-alpine

COPY . /usr/src/reconciler
WORKDIR /usr/src/reconciler

RUN python3 -m pip install -r requirements.txt
CMD ["python3", "reconciler.py"]
