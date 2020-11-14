from app import db

class US_Voter_Turnout(db.Model):
    __tablename__ = "US_Voter_Turnout"

    Id = db.Column(db.Integer, primary_key = True)
    Year = db.Column(db.Integer)
    VoterTurnout = db.Column(db.Float)
    IsPresidential = db.Column(db.Boolean)

    def __init__(self, Id, Year, VoterTurnout, IsPresidential):
        self.Id = Id
        self.Year = Year
        self.VoterTurnout = VoterTurnout
        self.IsPresidential = IsPresidential

    def __repr__(self):
        return '<US Voter Turnout {}>'.format(self.Id)

    def serialize(self):
        return {
            'Id':self.Id,
            'Year':self.Year,
            'VoterTurnout':self.VoterTurnout,
            'IsPresidential':self.IsPresidential
        }

class State_Voter_Turnout(db.Model):
    __tablename__ = "State_Voter_Turnout"

    Id = db.Column(db.Integer, primary_key = True)
    Year = db.Column(db.Integer)
    StateCode = db.Column(db.Integer)
    StateName = db.Column(db.Text)
    VoterTurnout = db.Column(db.Float)
    VotingEligiblePop = db.Column(db.Integer)
    VotingAgePop = db.Column(db.Integer)

    def __init__(self, Id, Year, StateCode, StateName, VoterTurnout, VotingEligiblePop, VotingAgePop):
        self.Id = Id
        self.Year = Year
        self.StateCode = StateCode
        self.StateName = StateName
        self.VoterTurnout = VoterTurnout
        self.VotingEligiblePop = VotingEligiblePop
        self.VotingAgePop = VotingAgePop

    def __repr__(self):
        return '<State Voter Turnout {}>'.format(self.Id)

    def serialize(self):
        return {
            'Id':self.Id,
            'Year':self.Year,
            'StateCode':self.StateCode,
            'StateName':self.StateName,
            'VoterTurnout':self.VoterTurnout,
            'VotingEligiblePop':self.VotingEligiblePop,
            'VotingAgePop':self.VotingAgePop
        }

class State_Codes(db.Model):
    __tablename__ = "State_Codes"

    Id = db.Column(db.Integer, primary_key = True)
    StateName = db.Column(db.Text)
    Abbreviation = db.Column(db.Text)

    def __init__(self, Id, StateName, Abbreviation):
        self.Id = Id
        self.StateName = StateName
        self.Abbreviation = Abbreviation

    def __repr__(self):
        return '<State Codes {}>'.format(self.Id)

    def serialize(self):
        return {
            'Id':self.Id,
            'StateName':self.StateName,
            'Abbreviation':self.Abbreviation
        }