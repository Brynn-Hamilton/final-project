import sqlite3 as sl
import csv

con = sl.connect("VoterTurnoutStats.db")
with con as c:
    c.execute("DROP TABLE IF EXISTS US_Voter_Turnout")
    c.execute("DROP TABLE IF EXISTS State_Voter_Turnout")
    c.execute("DROP TABLE IF EXISTS State_Codes")
    c.execute("""
        CREATE TABLE US_Voter_Turnout (
            Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            Year INTEGER NOT NULL,
            VoterTurnout FLOAT NOT NULL,
            IsPresidential INTEGER NOT NULL
        );
    """)
    c.execute("""
        CREATE TABLE State_Voter_Turnout (
            Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            Year INTEGER NOT NULL,
            StateCode INTEGER NOT NULL,
            StateName TEXT,
            VoterTurnout FLOAT NOT NULL,
            VotingEligiblePop INTEGER,
            VotingAgePop INTEGER
        );
    """)
    c.execute("""
        CREATE TABLE State_Codes (
            Id INTEGER NOT NULL PRIMARY KEY,
            StateName TEXT NOT NULL,
            Abbreviation TEXT NOT NULL
        );
    """)

    with open('voter_turnout.csv', 'r') as f:
        dr = csv.DictReader(f)
        to_db = [(i['Year'], i['United States VEP Turnout Rate'], i['Presidential Election']) for i in dr]
    
    c.executemany("INSERT INTO US_Voter_Turnout (Year, VoterTurnout, IsPresidential) VALUES (?, ?, ?);", to_db)

    with open('state_voter_turnout.csv', 'r') as f2:
        dr2 = csv.DictReader(f2)
        to_db_2 = [(i['Year'], i['Alphanumeric State Code'], i['State'], i['VEP Highest Office'], i['Voting-Eligible Population (VEP)'], i['Voting-Age Population (VAP)']) for i in dr2]

    c.executemany("INSERT INTO State_Voter_Turnout (Year, StateCode, StateName, VoterTurnout, VotingEligiblePop, VotingAgePop) VALUES (?, ?, ?, ?, ?, ?)", to_db_2)

    with open('state_list_mapping.csv', 'r') as f3:
        dr3 = csv.DictReader(f3)
        to_db_3 = [(i['StateId'], i['State'], i['Abbr']) for i in dr3]

    c.executemany("INSERT INTO State_Codes (Id, StateName, Abbreviation) VALUES (?, ?, ?)", to_db_3)