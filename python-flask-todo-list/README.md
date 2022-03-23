# Example SaaS application built with Python's Flask framework.

## Status
The application is kinda basic. You can view, add, update and delete tasks in a list.

In this commit, it isn't event a real SaaS! Most of the SaaS features you'd expect are missing:
* Sign up
* Login
* Private task list
* Invite others to collaborate on the same task list
* Growth metrics and badges to the top users
* Helpful onboarding nudges
... and a lot more 

But don't worry, this is why Nile Platform exists - to make it easy to add all these features. 

In follow up commits, we'll add all these capabilities step by step using Nile.
So you can learn to SaaSify your own application with Nile.

## To run this application on your own laptop:
```
git clone https://github.com/TheNileDev/examples
cd examples/python-flask-todo-list

# Install Flask. venv is recommended but not mandatory 
. venv/bin/activate 
pip install Flask

export FLASK_ENV=development

flask init-db # only needed the first time
flask run
```

Thats it! You should see something like:

```
 * Environment: development
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 599-119-277
```

and if you head over to http://127.0.0.1:5000/ you will see the world's most basic todo webapp. 

## To run in production
Don't. 

This is a toy app meant to demonstrate Nile's APIs. 

Ping us (gwen@thenile.dev) if you want to use Nile's APIs in production, but definitely not this toy Flask thing. 