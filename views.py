from flask import Flask, render_template, redirect, request, g, session, url_for, flash
from model import User
import config
import forms
import model

app = Flask(__name__)
app.config.from_object(config)

@app.route("/")
def index():
    return render_template("index.html")

# @app.route("/login")
# def login():
#     return render_template("login.html")

# @app.route("/login", methods=["POST"])
# def authenticate():
#     form = forms.LoginForm(request.form)
#     if not form.validate():
#         flash("Incorrect username or password") 
#         return render_template("login.html")

#     email = form.email.data
#     password = form.password.data

#     user = User.query.filter_by(email=email).first()

#     if not user or not user.authenticate(password):
#         flash("Incorrect username or password") 
#         return render_template("login.html")

#     login_user(user)
#     return redirect(request.args.get("next", url_for("index")))

@app.route("/game")
def game():
    return render_template("game.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/end")
def end():
    return render_template("end.html")

@app.route("/high_scores")
def high_scores():
    return render_template("high_scores.html")

@app.route("/high-scores", methods=["POST"])
def post_my_score():
    form = forms.LoginForm(request.form)
    if not form.validate():
        flash("Incorrect username or password") 
        return render_template("login.html")

    email = form.email.data
    password = form.password.data

    user = User.query.filter_by(email=email).first()

    if not user or not user.authenticate(password):
        flash("Incorrect username or password") 
        return render_template("login.html")

    login_user(user)
    return redirect(request.args.get("next", url_for("index")))


if __name__ == "__main__":
    app.run(debug=True)
