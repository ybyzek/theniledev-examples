from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import datetime

from app.db import get_db

bp = Blueprint('todo', __name__)

@bp.route('/')
def index():
    db = get_db()
    todos = db.execute(
        'SELECT id, task_name, status, created, due_date'
        ' FROM todo'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('todo/index.html', todos=todos)

@bp.route('/add', methods=('GET', 'POST'))
def create():
    if request.method == 'POST':
        task_name = request.form['task_name']
        due_date = request.form['due_date']
        status = request.form['status']
        error = None

        if not task_name:
            error = 'Task name is required.'

        try:
            parsed_due_date = datetime.strptime(due_date, "%d-%m-%Y")
        except ValueError:
           error = 'date "' + due_date + '" must follow dd-mm-YYYY format'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO todo (task_name, due_date, status)'
                ' VALUES (?, ?)',
                (task_name, parsed_due_date.strftime("%Y-%m-%d %H:%M:%S.%f"), status)
            )
            db.commit()
            return redirect(url_for('todo.index'))

    return render_template('todo/create.html')

def get_task(id):
    task = get_db().execute(
        'SELECT id, task_name, status, created, due_date'
        ' FROM todo'
        ' WHERE id = ?',
        (id,)
    ).fetchone()

    if task is None:
        abort(404, f"Task id {id} doesn't exist.")

    return task

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
def update(id):
    task = get_task(id)

    if request.method == 'POST':
        task_name = request.form['task_name']
        due_date = request.form['due_date']
        status = request.form['status']
        error = None

        if not task_name:
            error = 'Task name is required.'

        try:
            parsed_due_date = datetime.strptime(due_date, "%d-%m-%Y")
        except ValueError:
           error = 'date "' + due_date + '" must follow dd-mm-YYYY format'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE todo SET task_name = ?, due_date = ?, status = ?'
                ' WHERE id = ?',
                (task_name, parsed_due_date.strftime("%Y-%m-%d %H:%M:%S.%f"), status,id)
            )
            db.commit()
            return redirect(url_for('todo.index'))

    return render_template('todo/update.html', task=task)

@bp.route('/<int:id>/delete', methods=('POST',))
def delete(id):
    get_task(id)
    db = get_db()
    db.execute('DELETE FROM todo WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('todo.index'))