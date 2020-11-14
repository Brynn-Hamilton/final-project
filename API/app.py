from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
import os

app = Flask(__name__)

app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from models import US_Voter_Turnout, State_Voter_Turnout, State_Codes
from machineLearning import US_Voter_ML, State_Voter_ML

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/state/<state_>")
def state(state_):
    return render_template("state.html", statename = state_)

@app.route("/us-voter-turnout/historic")
def get_us_voter_turnout():
    try:
        us_voter_turnout = US_Voter_Turnout.query.order_by(US_Voter_Turnout.Year).all()
        return jsonify([x.serialize() for x in us_voter_turnout])
    except Exception as e:
        return(str(e)), 500

@app.route("/us-voter-turnout/years")
def us_voter_turnout_years():
    try:
        years = US_Voter_Turnout.query.with_entities(US_Voter_Turnout.Year).distinct().order_by(US_Voter_Turnout.Year)
        return jsonify([x[0] for x in years])
    except Exception as e:
        return(str(e)), 500

@app.route("/us-voter-turnout/historic/<year_>")
def us_voter_turnout_by_year(year_):
    try:
        us_voter_turnout = US_Voter_Turnout.query.filter(US_Voter_Turnout.Year == int(year_)).order_by(US_Voter_Turnout.Year).all()
        return jsonify([x.serialize() for x in us_voter_turnout])
    except Exception as e:
        return(str(e)), 500

@app.route("/us-voter-turnout/predict/all")
def us_voter_predict_all():
    try:
        x = US_Voter_ML.predict_historical_all()
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/us-voter-turnout/predict/<year_>")
def us_voter_predict_historic(year_):
    try:
        x = US_Voter_ML.predict_historical(year_)
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/us-voter-turnout/predict/<year_>/<isPresidential_>")
def us_voter_predict(year_, isPresidential_):
    try:
        x = US_Voter_ML.predict(year_, isPresidential_)
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/historic")
def get_state_voter_turnout():
    try:
        state_voter_turnout = State_Voter_Turnout.query.order_by(State_Voter_Turnout.Year).all()
        return jsonify([x.serialize() for x in state_voter_turnout])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/years")
def state_voter_turnout_years():
    try:
        years = State_Voter_Turnout.query.with_entities(State_Voter_Turnout.Year).distinct().order_by(State_Voter_Turnout.Year)
        return jsonify([x[0] for x in years])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/historic/<year_>")
def state_voter_turnout_by_year(year_):
    try:
        state_voter_turnout = State_Voter_Turnout.query.filter(State_Voter_Turnout.Year == int(year_)).order_by(State_Voter_Turnout.Year).all()
        return jsonify([x.serialize() for x in state_voter_turnout])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/historic/<year_>/<statecode_>")
def state_voter_turnout_by_year_and_state(year_, statecode_):
    try:
        state_voter_turnout = State_Voter_Turnout.query.filter(State_Voter_Turnout.Year == int(year_), State_Voter_Turnout.StateCode == int(statecode_)).order_by(State_Voter_Turnout.Year).all()
        return jsonify([x.serialize() for x in state_voter_turnout])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/historic/all/<statecode_>")
def state_voter_turnout_by_state(statecode_):
    try:
        state_voter_turnout = State_Voter_Turnout.query.filter(State_Voter_Turnout.StateCode == int(statecode_)).order_by(State_Voter_Turnout.Year).all()
        return jsonify([x.serialize() for x in state_voter_turnout])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/predict/all")
def state_voter_predict_all():
    try:
        x = State_Voter_ML.predict_historical_all()
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/predict/<year_>/<stateCode_>")
def state_voter_predict_historic(year_, stateCode_):
    try:
        x = State_Voter_ML.predict_historical(year_, stateCode_)
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/predict/<year_>/<stateCode_>/<eligiblePop_>/<agePop_>")
def state_voter_predict(year_, stateCode_, eligiblePop_, agePop_):
    try:
        if(int(eligiblePop_) == 0 or int(agePop_) == 0):
            maxStateYear = State_Voter_Turnout.query.filter(State_Voter_Turnout.Year <= year_, State_Voter_Turnout.StateCode == stateCode_).order_by(State_Voter_Turnout.Year.desc()).first()
            if(int(eligiblePop_) == 0):
                eligiblePop_ = maxStateYear.VotingEligiblePop
            if(int(agePop_) == 0):
                agePop_ = maxStateYear.VotingAgePop
        x = State_Voter_ML.predict(year_, stateCode_, eligiblePop_, agePop_)
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-voter-turnout/predict/state/<year_>/<stateCode_>/<eligiblePop_>/<agePop_>")
def state_voter_predict_by_state(year_, stateCode_, eligiblePop_, agePop_):
    try:
        if(int(eligiblePop_) == 0 or int(agePop_) == 0):
            maxStateYear = State_Voter_Turnout.query.filter(State_Voter_Turnout.Year <= year_, State_Voter_Turnout.StateCode == stateCode_).order_by(State_Voter_Turnout.Year.desc()).first()
            if (maxStateYear is not None):
                if(int(eligiblePop_) == 0):
                    eligiblePop_ = maxStateYear.VotingEligiblePop
                if(int(agePop_) == 0):
                    agePop_ = maxStateYear.VotingAgePop
        x = State_Voter_ML.predict_by_state(year_, stateCode_, eligiblePop_, agePop_)
        return jsonify([i.serialize() for i in x])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-codes")
def get_state_codes():
    try:
        state_codes = State_Codes.query.all()
        return jsonify([x.serialize() for x in state_codes])
    except Exception as e:
        return(str(e)), 500

@app.route("/state-codes/states/<state_name_>")
def state_codes_by_name(state_name_):
    try:
        state_codes = State_Codes.query.filter(func.upper(State_Codes.StateName) == func.upper(state_name_)).one()
        return jsonify(state_codes.serialize())
    except Exception as e:
        return(str(e)), 500

@app.route("/state-codes/codes/<code_>")
def state_codes_by_id(code_):
    try:
        state_codes = State_Codes.query.filter(State_Codes.Id == code_).one()
        return jsonify(state_codes.serialize())
    except Exception as e:
        return(str(e)), 500

@app.route("/state-codes/abbr/<abbr_>")
def state_codes_by_abbr(abbr_):
    try:
        state_codes = State_Codes.query.filter(func.upper(State_Codes.Abbreviation) == func.upper(abbr_)).one()
        return jsonify(state_codes.serialize())
    except Exception as e:
        return(str(e)), 500

if __name__ == "__main__":
    app.run()