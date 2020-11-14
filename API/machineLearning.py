import pandas as pd
import numpy as np
from sklearn.svm import SVR
import scipy.stats as stats

from models import US_Voter_Turnout, State_Voter_Turnout, State_Codes

class US_Voter_ML():
    @staticmethod
    def train():
        svr_rbf = SVR(kernel='rbf', C=800, gamma=0.1, epsilon=0.1)
        us_voter_turnout = US_Voter_Turnout.query.all()
        data = []
        target = []
        for t in us_voter_turnout:
            data.append([t.Year, t.IsPresidential])
            target.append(t.VoterTurnout)
        x = np.array(data)
        y = np.array(target)
        return svr_rbf.fit(x, y)

    @staticmethod
    def predict_historical_all():
        us_voter_turnout = US_Voter_Turnout.query.all()
        data = []
        for t in us_voter_turnout:
            data.append([t.Year, t.IsPresidential])
        x = np.array(data)
        a = US_Voter_ML.train().predict(x)
        vals = []
        for i, t in enumerate(us_voter_turnout):
            vals.append(US_Voter_Turnout(t.Id, t.Year, a[i], t.IsPresidential))
        return vals
        #return np.vstack(([i[0] for i in x], US_Voter_ML.train().predict(x))).T

    @staticmethod
    def predict_historical(year):
        us_voter_turnout = US_Voter_Turnout.query.filter(US_Voter_Turnout.Year == year).all()
        data = []
        for t in us_voter_turnout:
            data.append([t.Year, t.IsPresidential])
        x = np.array(data)
        a = US_Voter_ML.train().predict(x)
        vals = []
        for i, t in enumerate(us_voter_turnout):
            vals.append(US_Voter_Turnout(t.Id, t.Year, a[i], t.IsPresidential))
        return vals
        #return np.vstack(([i[0] for i in x], US_Voter_ML.train().predict(x))).T

    @staticmethod
    def predict(year, isPresidential):
        x = np.array([[int(year), int(isPresidential)]])
        a = US_Voter_ML.train().predict(x)
        vals = [US_Voter_Turnout(0, int(x[0][0]), a[0], int(x[0][1]))]
        return vals
        #return np.vstack(([i[0] for i in x], US_Voter_ML.train().predict(x))).T

class State_Voter_ML():
    @staticmethod
    def train():
        svr_rbf = SVR(kernel='rbf', C=800, gamma=0.1, epsilon=0.1)
        state_voter_turnout = State_Voter_Turnout.query.all()
        data = []
        target = []
        for t in state_voter_turnout:
            data.append([t.Year, t.StateCode, t.VotingEligiblePop, t.VotingAgePop])
            target.append(t.VoterTurnout)
        x = np.array(data)
        y = np.array(target)
        return svr_rbf.fit(x, y)

    @staticmethod
    def train_by_state(statecode):
        svr_rbf = SVR(kernel='rbf', C=800, gamma=0.1, epsilon=0.1)
        state_voter_turnout = State_Voter_Turnout.query.filter(State_Voter_Turnout.StateCode == statecode).all()
        data = []
        target = []
        for t in state_voter_turnout:
            data.append([t.Year, t.StateCode, t.VotingEligiblePop, t.VotingAgePop])
            target.append(t.VoterTurnout)
        x = np.array(data)
        y = np.array(target)
        return svr_rbf.fit(x, y)

    @staticmethod
    def predict_historical_all():
        state_voter_turnout = State_Voter_Turnout.query.all()
        data = []
        for t in state_voter_turnout:
            data.append([t.Year, t.StateCode, t.VotingEligiblePop, t.VotingAgePop])
        x = np.array(data)
        a = State_Voter_ML().train().predict(x)
        vals = []
        for i, t in enumerate(state_voter_turnout):
            vals.append(State_Voter_Turnout(t.Id, t.Year, t.StateCode, t.StateName, a[i], t.VotingEligiblePop, t.VotingAgePop))
        return vals

    @staticmethod
    def predict_historical(year, stateCode):
        state_voter_turnout = State_Voter_Turnout.query.filter(State_Voter_Turnout.Year == year, State_Voter_Turnout.StateCode == stateCode).all()
        data = []
        for t in state_voter_turnout:
            data.append([t.Year, t.StateCode, t.VotingEligiblePop, t.VotingAgePop])
        x = np.array(data)
        a = State_Voter_ML().train().predict(x)
        vals = []
        for i, t in enumerate(state_voter_turnout):
            vals.append(State_Voter_Turnout(t.Id, t.Year, t.StateCode, t.StateName, a[i], t.VotingEligiblePop, t.VotingAgePop))
        return vals

    @staticmethod
    def predict(year, stateCode, votingEligiblePop, votingAgePop):
        x = np.array([[int(year), int(stateCode), int(votingEligiblePop), int(votingAgePop)]])
        state = State_Codes.query.filter(State_Codes.Id == int(stateCode)).one()
        a = State_Voter_ML().train().predict(x)
        vals = [State_Voter_Turnout(0, int(x[0][0]), int(x[0][1]), state.StateName, a[0], int(x[0][2]), int(x[0][3]))]
        return vals

    @staticmethod
    def predict_by_state(year, stateCode, votingEligiblePop, votingAgePop):
        x = np.array([[int(year), int(stateCode), int(votingEligiblePop), int(votingAgePop)]])
        state = State_Codes.query.filter(State_Codes.Id == int(stateCode)).one()
        a = State_Voter_ML().train_by_state(stateCode).predict(x)
        vals = [State_Voter_Turnout(0, int(x[0][0]), int(x[0][1]), state.StateName, a[0], int(x[0][2]), int(x[0][3]))]
        return vals