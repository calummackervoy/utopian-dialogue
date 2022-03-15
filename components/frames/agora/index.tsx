import React, { useEffect, useState } from "react";
import { Text, Button, Center, Container } from "@chakra-ui/react";
import { css } from "@emotion/css";

import { WindupChildren, Pause, Pace, Effect } from "windups";
import { IStoryFrame } from "../../lib/types";
import Dialogue from "../../lib/dialogue";
import useDialogue from "../../../hooks/useDialogue";
import usePlayer from "../../../hooks/usePlayer";
import { LONG_PAUSE, SHORT_PAUSE, SLOW_PACE, INTUITION_COLOUR, FAST_PACE } from "../../lib/constants";
import { IMessage, DialogueProvider } from "../../../context/dialogueContext";
import RelationshipIndicator from "../../lib/relationshipIndicator";
import {World, PrisonStates, GovernanceStates} from "../../../context/bigCityContext";
import useBigCity from "../../../hooks/useBigCity";
import { performers, PerformerNames, IPerformer } from "../../lib/performers";
import { colourFadeAnimationCss, fadeOutTransition, fadeInTransition } from "../../lib/animations";
import { Relationships, SelfIdentityLabels, Values, TarotCardNames, tarotCards } from "../../lib/relationships";


const SHAKE_TIMEOUT = 500;
const GREENSIGHT_TEXT_COLOUR = "#27b197";

function AgoraDialogue({followLink} : IStoryFrame) : React.ReactElement {

    const { addMessage, dialogueEnded, setDialogueEnded, selectRandomFrom } = useDialogue();
    const { world, setWorldItem } = useBigCity();
    const { playerPerformer, hasRelationshipPair, addRelationship, removeRelationship, buildRelationshipObject, hasRelationshipStrongerThan,
        hasRelationshipWeakerThan } = usePlayer();
    const [ dialogueStarted, setDialogueStarted ] = useState(false);

    const [shakingClasses, setShakingClasses] = useState(null);

    const shakeEffect = (classes: string, timeout=SHAKE_TIMEOUT) => {
        setShakingClasses(classes);

        setTimeout(() => {
            setShakingClasses(null);
        }, timeout);
    }

    useEffect(() => {
        //addMessage(tarotCards[TarotCardNames.COURAGE]);
        //addMessage(tarotCards[TarotCardNames.GREENSIGHT]);

        addMessage({
            content: (
                <>
                <p>"Salutations!" Says a young lady, with a beaming smile. "My name is Mari- "</p>
                <Pause ms={SHORT_PAUSE * 0.5} />
                </>
            ),
            performer: performers[PerformerNames.MARI],
        });

        addMessage({
            content: <p>"Do you remember who you are?!" a man interrupts her. He is addressing you<Pause ms={SHORT_PAUSE * 0.5} /></p>,
            performer: performers[PerformerNames.DOUGLAS],
            sideEffect: () => {
                addRelationship(PerformerNames.DOUGLAS, buildRelationshipObject(Relationships.NOSTALGIA, 2));
            },
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"Of course they don't, Douglas. None of us do"</p>,
            performer: performers[PerformerNames.MARI],
            getResponses: () => doYouRememberResponses(false)
        });
    }, []);

    const doYouRememberResponses = (hasGreensight: boolean) => {
        let choices: IMessage[] = [
            {
                performer: playerPerformer,
                selectFollowup: () => {
                    addMessage({
                        content: <p>"Really?<Pause ms={SHORT_PAUSE} /> Wow!<Pause ms={LONG_PAUSE}/> Then perhaps there is some hope for all of us"</p>,
                        performer: performers[PerformerNames.DOUGLAS]
                    });

                    addMessage({
                        content: <p>His eyes are sparkling as he says it</p>,
                        performer: performers[PerformerNames.DOUGLAS],
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: <p>{selectRandomFrom(["Mari mumbles disapprovingly", "Mari seems disrupted by your statement", "Mari is frowning"])}</p>,
                        performer: performers[PerformerNames.DOUGLAS],
                        includeContinuePrompt: true
                    });

                    agoraMeeting();
                },
                sideEffect: () => {
                    addRelationship(PerformerNames.DOUGLAS, buildRelationshipObject(Relationships.HOPE_SURROGATE, 1));
                    addRelationship(PerformerNames.MARI, buildRelationshipObject(Relationships.TRUST, -1));
                    addRelationship("self", buildRelationshipObject(SelfIdentityLabels.SELF_KNOWLEDGE_CLAIM, null));
                },
                shorthandContent: <Text>{selectRandomFrom(["I remember who I am", "Actually I do remember"])}</Text>
            },
            {
                performer: playerPerformer,
                selectFollowup: () => {
                    addMessage({
                        content: <p>Douglas seems disappointed by this</p>,
                        performer: performers[PerformerNames.DOUGLAS],
                        includeContinuePrompt: true
                    });

                    agoraMeeting();
                },
                shorthandContent: <Text>{selectRandomFrom(["No, I don't remember", "I don't remember who I am"])}</Text>
            }
        ];

        if(!hasGreensight) choices.push({
            performer: playerPerformer,
            selectFollowup: () => {
                addMessage({
                    content: (
                        <>
                        <p>Douglas looks skeptical</p><Pause ms={SHORT_PAUSE * 0.5} />
                        <p>"Like... remembering who you are?"</p>
                        </>
                    ),
                    performer: performers[PerformerNames.DOUGLAS],
                    getResponses: () => doYouRememberResponses(true)
                })
            },
            sideEffect: () => {
                addRelationship("self", buildRelationshipObject(SelfIdentityLabels.HAS_GREENSIGHT, null));
            },
            shorthandContent: <Text>"I am gifted with the Greensight, I see things that others do not"</Text>
        });

        return choices
    }

    const agoraMeeting = () => {
        addMessage({
            content: <p><em>Your choices are affecting how other characters view you, and how you view them</em></p>,
            performer: playerPerformer,
            includeContinuePrompt: true
        });

        if(hasRelationshipStrongerThan(PerformerNames.MARI, Relationships.TRUST, 0)) {
            addMessage({
                content: <p>Mari addresses you. "We've been meeting here, for several days, since the Great Pop"</p>,
                performer: performers[PerformerNames.MARI],
                includeContinuePrompt: true
            });
            
            addMessage({
                content: <p>"Once we woke up we needed to figure out again how to live, we were all disoriented and without purpose"</p>,
                performer: performers[PerformerNames.MARI],
                includeContinuePrompt: true
            });

            addMessage({
                content: <p>"We call this the Agora. Here we ask the question 'How do we want to live together?' and then we delegate and organise to make the answers reality"</p>,
                performer: performers[PerformerNames.MARI],
                includeContinuePrompt: true,
                getResponses: preMeetingQuestions
            });
        }
        else {
            addMessage({
                content: <p>Douglas address you. "We've been meeting here, for several days, since the Great Pop"</p>,
                performer: performers[PerformerNames.DOUGLAS],
                includeContinuePrompt: true
            });

            addMessage({
                content: <p>"It's a governance of sorts. <Pause ms={SHORT_PAUSE} />Once we woke up we needed to figure out again how to live, so we've been piecing together what life was like, before the Great Pop"</p>,
                performer: performers[PerformerNames.DOUGLAS],
                includeContinuePrompt: true
            });

            addMessage({
                content: <p>"But now that you're here,<Pause ms={SHORT_PAUSE * 0.2}/> maybe we can shift our focus to recovering the Old World, and rebuilding it!"</p>,
                performer: performers[PerformerNames.DOUGLAS],
                includeContinuePrompt: true,
                getResponses: preMeetingQuestions
            });
        }
    }

    const preMeetingQuestions = (askedQuestions: number[] = []) : IMessage[] => {
        // you can copy this pattern to allow the player to go through a range of dialogue choices

        let choices = [];
        let askedHowMany = askedQuestions.includes(1);

        if(!askedQuestions.includes(0)) {
            askedQuestions.push(0);

            choices.push({
                content: <p>"How long since the Great Pop?"</p>,
                performer: playerPerformer,
                selectFollowup: () => {
                    addMessage({
                        content: <p>"Have you just woken up?" A woman says with evident surprise</p>,
                        performer: performers[PerformerNames.ALICIA],
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: <p>"It's been {world.daysSinceGreatPop} days" Mari answers. "We've been meeting here for {world.daysSinceGreatPop - 1}"</p>,
                        performer: performers[PerformerNames.MARI],
                        getResponses: () => preMeetingQuestions(askedQuestions)
                    });
                }
            });
        }

        if(!askedQuestions.includes(1)) {
            askedQuestions.push(1);

            choices.push({
                content: <p>"How many people are here, in attendance?"</p>,
                performer: playerPerformer,
                selectFollowup: () => {
                    addMessage({
                        content: <p>"Around fifty, in total"</p>,
                        performer: performers[PerformerNames.MARI],
                        getResponses: () => preMeetingQuestions(askedQuestions)
                    });
                }
            });
        }

        if(askedHowMany && !askedQuestions.includes(2)) {
            askedQuestions.push(2);

            choices.push({
                content: <p>"And how many people, in the city?"</p>,
                performer: playerPerformer,
                selectFollowup: () => {
                    addMessage({
                        content: <p>"A lot more than that"<Pause ms={SHORT_PAUSE} /></p>,
                        performer: performers[PerformerNames.ALICIA]
                    });

                    addMessage({
                        content: <p>Our numbers are growing, little by little"</p>,
                        performer: performers[PerformerNames.MARI],
                        getResponses: () => preMeetingQuestions(askedQuestions)
                    });
                }
            });
        }

        if(!askedQuestions.includes(3)) {
            askedQuestions.push(3);

            choices.push({
                content: <p>"Is the city governed here, in the Agora?"</p>,
                performer: playerPerformer,
                selectFollowup: () => {
                    addMessage({
                        content: <p>Nobody seems sure how to answer this.</p>,
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: <p>"Not so much 'governance', as far as I understand the term"</p>,
                        performer: performers[PerformerNames.ALICIA],
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: <p>"Not in an everday sense" {PerformerNames.MARI} admits.<Pause ms={LONG_PAUSE} /> "But it's becoming known as the central place <Pace ms={SLOW_PACE * 4}>to engage in the city politics</Pace>"</p>,
                        performer: performers[PerformerNames.MARI],
                        getResponses: () => preMeetingQuestions(askedQuestions)
                    });
                }
            });
        }

        choices.push({
            content: <p>...</p>,
            perfomer: playerPerformer,
            selectFollowup: rupertIntroduction,
            shorthandContent: <p>No more questions</p>
        });

        return choices
    }

    const rupertIntroduction = () => {
        addMessage({
            content: (
                <>
                <p>A man dressed in fine clothing is approaching, his face is red and puffy with sweat.</p>
                <p>He is leading a procession of five other men, dressed in bright uniform.</p>
                <Pause ms={LONG_PAUSE} />
                <p>"And just <Pause ms={SHORT_PAUSE *0.25}/><b>what</b> is the meaning of all this <em>nonsense</em>?!"</p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>He calls out to the audience, his arms waving theatrically:</p>
                <p>"Good citizens of <b>Rupertston</b>, I am your leader!"</p>
                <Pause ms={SHORT_PAUSE * 0.75} />
                <p>"I understand that The Great Pop seems to have affected our memories but nevertheless!<Pause ms={SHORT_PAUSE * 0.25} /> <em>I am your mayor!</em>"</p>
                <Pause ms={LONG_PAUSE} />
                <p>"Nevertheless I have all of the necessary <Pause ms={SHORT_PAUSE*0.25}/><em>*ahem*</em> records to prove it"</p><Pause ms={SHORT_PAUSE} />
                <p>He is waving a ledger of papers in his hand.</p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT],
            getResponses: () => {
                const ledgers = <p>"Ledgers<Pace ms={SLOW_PACE}>...</Pace> of property records, debts"</p>;

                const smugRupert = (player: boolean) => {
                    const subject = player ? "your" : "Mari's";
                    const reaction = player ? "Your ribcage is saw from his effort" : "Mari holds her ribcage and frowns deeply";

                    addMessage({
                        content: <p>"And the most recent ones<Pace ms={SLOW_PACE * 4}>...</Pace> Signed and stamped by Yours Truly"<Pause ms={SHORT_PAUSE * 0.25} /> Rupert adds smugly</p>,
                        performer: performers[PerformerNames.RUPERT],
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: <p>Douglas is reading the ledgers keenly over {subject} shoulder,<Pause ms={SHORT_PAUSE * 1.5} /></p>,
                        performer: performers[PerformerNames.DOUGLAS]
                    });

                    addMessage({
                        content: <p>But a tall guardsman wrestles the ledger from {subject} grip roughly.<Pause ms={SHORT_PAUSE} /> {reaction}</p>,
                        performer: performers[PerformerNames.BURLY],
                        includeContinuePrompt: true,
                        selectFollowup: followup
                    });
                }

                return [
                    {
                        content: (
                            <p>It is a thick ledger<Pace ms={SLOW_PACE * 4}> of semi-organised documents</Pace><Pause ms={SHORT_PAUSE * 0.75} /> bound in leather. <Pause ms={SHORT_PAUSE * 0.5} />The documents are pertaining to credits and debts owed the local City Mayoral,<Pause ms={SHORT_PAUSE * 0.5} /> and to property records.</p>
                        ),
                        performer: playerPerformer,
                        selectFollowup: () => {
                            addMessage({
                                content: ledgers,
                                performer: playerPerformer
                            });

                            smugRupert(true);
                        },
                        shorthandContent: <p>Take a look at the records</p>,
                    },
                    {
                        content: <></>,
                        performer: playerPerformer,
                        selectFollowup: () => {
                            addMessage({
                                content: (
                                    <>
                                    <p>Mari snatches the ledger from his hand<Pause ms={SHORT_PAUSE * 0.25} />, and scans them scrupulously<Pause ms={LONG_PAUSE} /></p>
                                    {ledgers}
                                    </>
                                ),
                                performer: performers[PerformerNames.MARI],
                                includeContinuePrompt: true
                            });

                            smugRupert(false);

                        },
                        shorthandContent: <p>[Say nothing]</p>
                    }
                ]
            }
        });

        const followup = () => {
            addMessage({
                content: <p>"Your gathering here is illegal!" shrieks the tall guardsman,<Pause ms={SHORT_PAUSE * 0.5} /> who is wearing a fiercely bright orange and white blouse.</p>,
                performer: performers[PerformerNames.BURLY],
                getResponses: () => {
                    return [
                        {
                            selectFollowup: burlyWho,
                            sideEffect: () => {
                                addRelationship(PerformerNames.BURLY, buildRelationshipObject(Relationships.TRUST, -1));
                            },
                            content: <p>"Who are you?"</p>,
                            includeContinuePrompt: true,
                            performer: playerPerformer
                        },
                        {
                            selectFollowup: () => {
                                addRelationship(PerformerNames.BURLY, buildRelationshipObject(Relationships.TRUST, -2));
                                addRelationship("self", buildRelationshipObject(SelfIdentityLabels.COURAGEOUS, 1));

                                if(hasRelationshipPair("self", SelfIdentityLabels.HAS_GREENSIGHT)) {
                                    addMessage({
                                        content: <Text color={GREENSIGHT_TEXT_COLOUR}>This man's aura has become tense <Pause ms={SHORT_PAUSE * 0.25} />and carries the potential of violence</Text>,
                                        performer: playerPerformer,
                                        includeContinuePrompt: true
                                    });
                                }

                                burlyWho();
                            },
                            content: <p>"Illegal? Says who?"</p>,
                            includeContinuePrompt: true,
                            performer: playerPerformer
                        },
                        {
                            selectFollowup: () => {
                                addMessage({
                                    content: <p>"Who are you?"</p>,
                                    performer: performers[PerformerNames.MARI],
                                    includeContinuePrompt: true
                                });

                                burlyWho();
                            },
                            content: <></>,
                            shorthandContent: <p>[Say nothing]</p>,
                            performer: playerPerformer
                        }
                    ]
                }
            });
        }
    }

    const burlyWho = () => {
        addMessage({
            content: (
                <>
                <p>He is taken aback by the question, a little stung.</p>
                <Text color={INTUITION_COLOUR}>He feels as though his relevance has been brought into question.</Text>
                <Pause ms={SHORT_PAUSE * 1.33} />
                <p>"I- I- the Burly Bodyguard"</p>
                <Pause ms={SHORT_PAUSE * 0.5} />
                <p>He gathers himself and stands up taller.</p>
                <p>"I'm Mayor Rupert's lead bodyguard"</p>
                </>
            ),
            performer: performers[PerformerNames.BURLY],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"Oh, well"</p>
                <Pause ms={SHORT_PAUSE * 0.75} />
                <p>"That sounds like a real honour" the young lady responds.</p>
                <Text color={INTUITION_COLOUR}>She is grinning widely as she says it.</Text>
                </>
            ),
            performer: performers[PerformerNames.MARI],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"It is an honour" the burly bodyguard responds bitterly.</p>
                <p>His face folds, his frown a deepening grotesque.</p>
                <p>He folds his arms protectively.</p>
                </>
            ),
            performer: performers[PerformerNames.BURLY],
            includeContinuePrompt: true
        });

        mariQuestionsRupert();
    }

    const mariQuestionsRupert = () => {
        addMessage({
            content: (
                <>
                <p>Mari stands up onto the platform in the centre of the arena and calls out to the crowd.</p>
                <p>"Good people!<Pause ms={LONG_PAUSE} /> what do we need a false mayor for?<Pause ms={SHORT_PAUSE * 1.25} /> and why do we need this ledger of his,<Pause ms={SHORT_PAUSE * 0.5} /> marking our names <Pace ms={SLOW_PACE * 5}>with debts and with credits?"</Pace></p>
                <Pause ms={SHORT_PAUSE * 1.5} />
                </>
            ),
            performer: performers[PerformerNames.MARI],
        });

        addMessage({
            content: <p>Some in the Agora cheer.<Pause ms={LONG_PAUSE} /> Others seem unsure</p>,
            performer: playerPerformer,
            includeContinuePrompt: true
        });

        discussionAboutDebt();
    }

    const discussionAboutDebt = () => {
        addMessage({
            content: <p><Pace ms={SLOW_PACE * 5}>"What <em>is</em> in the ledger?"</Pace> Douglas asks</p>,
            performer: performers[PerformerNames.DOUGLAS],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"<b>Debts</b>". She pronounces the word with enunciated distaste.<Pause ms={SHORT_PAUSE * 1.5} /> "Obligations to pay, forced by the state.<Pause ms={SHORT_PAUSE * 1.5} /> You need to find a way to pay them, <Pace ms={SLOW_PACE * 5}>and pay them regularly</Pace><Pause ms={SHORT_PAUSE * 0.5} />, and as long as you have them you are not free"</p>,
            performer: performers[PerformerNames.MARI],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"Taxes and currency are how we direct ourselves to a common goal!" {PerformerNames.RUPERT} complains<Pause ms={SHORT_PAUSE} /></p>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"The debts are taken from us,<Pause ms={SHORT_PAUSE * 0.4} /> paid to men like <em>him</em>,<Pause ms={SHORT_PAUSE * 0.5} /> as a way to manipulate our activities into funding their enterprise"</p>,
            performer: performers[PerformerNames.MARI],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"<em>My</em> enterprise?!<Pause ms={SHORT_PAUSE} /> I suppose that you'd prefer that <em>you</em> were mayor, then<Pause ms={LONG_PAUSE} /></p>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"By paying eachother using my <em>currency</em>,<Pause ms={SHORT_PAUSE * 0.1} /> you are able to transfer the debt to me.<Pause ms={SHORT_PAUSE} /> Safe in the knowledge that it is <Pace ms={SLOW_PACE * 4}><em>guaranteed</em></Pace> by the vitality of my force"<Pause ms={LONG_PAUSE} /></p>,
            performer: performers[PerformerNames.RUPERT]
        });

        addMessage({
            content: <Text color={INTUITION_COLOUR}>Burly is radiating pride when Rupert discusses the vitality of his force.</Text>,
            performer: performers[PerformerNames.BURLY],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"In return, you pay me a portion of that debt back each month,<Pause ms={SHORT_PAUSE * 0.2} /> and respect my order"<Pause ms={LONG_PAUSE} /></p>
                <p>This forms the basis of our <b>social contract</b><Pause ms={SHORT_PAUSE} /><Pace ms={SLOW_PACE * 3}>... </Pace>and ensures that we don't descend into chaos"</p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"Our debts could be to eachother,<Pause ms={SHORT_PAUSE * 0.1} /> in principle.<Pause ms={SHORT_PAUSE * 0.2} /> To our <Pause ms={SHORT_PAUSE * 0.1} /><em>shared</em> enterprise"<Pause ms={SHORT_PAUSE} /></p>,
            performer: performers[PerformerNames.MARI],
            getResponses: () => {
                return [
                    {
                        content: (
                            <>
                            <p>"Without a powerful state, it is a war of all against all"<Pause ms={SHORT_PAUSE} /></p>
                            <p>"We are selfish by nature and will not provide for eachother unless we are to gain in doing so"<Pause ms={LONG_PAUSE} /></p>
                            <p>"Friends, <Pace ms={SLOW_PACE * 4}>we <em>need</em> a powerful state,</Pace><Pause ms={SHORT_PAUSE} /> to bind us into the common interest<Pause ms={SHORT_PAUSE * 0.5} />, to serve the collective will"</p>
                            </>
                        ),
                        sideEffect: () => {
                            addRelationship(PerformerNames.MARI, buildRelationshipObject(Relationships.TRUST, -1));
                            addRelationship(PerformerNames.RUPERT, buildRelationshipObject(Relationships.TRUST, 1));
                        },
                        selectFollowup: () => {
                            addMessage({
                                content: <p>"To serve the collective will,<Pause ms={SHORT_PAUSE * 0.5} /> and <em>me</em><Pause ms={SHORT_PAUSE * 0.25} />, its' arbritor!"<Pause ms={SHORT_PAUSE * 0.25} /> Rupert adds eagerly</p>,
                                performer: performers[PerformerNames.RUPERT],
                                includeContinuePrompt: true
                            });

                            debtChallenge();
                        },
                        performer: playerPerformer,
                        includeContinuePrompt: true,
                        shorthandContent: <p>"Without a powerful state, it is a war of all against all"</p>
                    },
                    {
                        content: (
                            <>
                            <p>"We are motivated by <em>care</em>,<Pause ms={SHORT_PAUSE * 0.5} /> we regularly care for eachother beyond our immediate selves.<Pause ms={LONG_PAUSE} /></p>
                            <p>"There are any number of ways that we can pool resources,<Pause ms={SHORT_PAUSE * 0.5} /> and we really only need <b>trust</b> if we have a reason not to trust the other to whom we are <em>giving</em>"</p>
                            </>
                        ),
                        sideEffect: () => {
                            addRelationship(PerformerNames.MARI, buildRelationshipObject(Relationships.TRUST, 1));
                            addRelationship(PerformerNames.RUPERT, buildRelationshipObject(Relationships.TRUST, -2));
                        },
                        selectFollowup: () => {
                            addMessage({
                                content: <p>"Sedition!"<Pause ms={SHORT_PAUSE * 0.5} /> Burly complains<Pause ms={LONG_PAUSE} /></p>,
                                performer: performers[PerformerNames.BURLY]
                            });

                            addMessage({
                                content: <p>"I think that we could organise our society to establish trust in giving"<Pause ms={SHORT_PAUSE} /> Mari agrees pensively<Pause ms={SHORT_PAUSE} /></p>,
                                performer: performers[PerformerNames.MARI]
                            });

                            addMessage({
                                content: (
                                    <>
                                    <p><Pace ms={FAST_PACE}>"Sedition!"</Pace><Pause ms={LONG_PAUSE} /></p>
                                    <p>"I will <Pace ms={SLOW_PACE * 3}><em>not</em></Pace> let you subvert my sacred right to distribute wealth!"<Pause ms={LONG_PAUSE} /></p>
                                    </>
                                ),
                                performer: performers[PerformerNames.RUPERT],
                                getResponses: () => [
                                    {
                                        content: (
                                            <>
                                            <Text color={INTUITION_COLOUR}><em>You must <Pace ms={SLOW_PACE * 2}>not</Pace> allow them to take your collective property!</em></Text><Pause ms={SHORT_PAUSE} />
                                            <p>A voice calls from deep within you</p><Pause ms={SHORT_PAUSE} />
                                            <p>You know now what you have to do</p><Pause ms={SHORT_PAUSE} />
                                            </>
                                        ),
                                        performer: playerPerformer,
                                        sideEffect: () => {
                                            addRelationship("self", buildRelationshipObject(SelfIdentityLabels.COURAGEOUS, 1));
                                            addRelationship(PerformerNames.MARI, buildRelationshipObject(Relationships.TRUST, 1));
                                        },
                                        getResponses: () => [
                                            {
                                                content: (
                                                    <>
                                                    <p>Deep inside the pool of your soul a primordial force of Resistance wants to make itself known<Pause ms={LONG_PAUSE} /></p>
                                                    <p><Pace ms={SLOW_PACE * 2}>"NOOOOOOOO!"</Pace> it roars with your voice, <Pace ms={SLOW_PACE * 3}>fading softly into silence</Pace></p>
                                                    </>
                                                ),
                                                includeContinuePrompt: true,
                                                performer: playerPerformer,
                                                selectFollowup: () => {
                                                    addMessage({
                                                        content: (
                                                            <>
                                                            <p>"We'll be eating soup of stone,<Pause ms={SHORT_PAUSE * 0.5} /> til what we grow is what we own.."<Pause ms={SHORT_PAUSE} /></p>
                                                            <p>"But we won't steal from the land what's freely given"<Pause ms={SHORT_PAUSE} /></p>
                                                            <p><Pace ms={SLOW_PACE * 3}>"Tear up the deeds to the land</Pace><Pause ms={SHORT_PAUSE * 0.25} />, <Pace ms={FAST_PACE * 0.5}>throw the debts into the furnace,</Pace> debts to <Pace ms={SLOW_PACE * 3}><em>God</em></Pace> to the <Pace ms={SLOW_PACE * 3}><em>banks</em></Pace> and to the <Pace ms={SLOW_PACE * 3}><em>landlord</em></Pace>"<Pause ms={SHORT_PAUSE} /></p>
                                                            </>
                                                        ),
                                                        performer: playerPerformer,
                                                        includeContinuePrompt: true
                                                    });

                                                    addMessage({
                                                        content: (
                                                            <>
                                                            <p>"And even if we're just one pistol<Pause ms={SHORT_PAUSE * 0.25} /> against an army of policemen<Pause ms={SHORT_PAUSE * 0.3} />, I <Pace ms={SLOW_PACE * 3}><em>insist</em></Pace> that we are many<Pause ms={SHORT_PAUSE * 0.25} /> and they are few"<Pause ms={SHORT_PAUSE} /></p>
                                                            <p>"If we don't stand up now then we might never and we'll never know again our freedom taken"<Pause ms={SHORT_PAUSE} /></p>
                                                            </>
                                                        ),
                                                        performer: playerPerformer,
                                                        includeContinuePrompt: true
                                                    });

                                                    addMessage({
                                                        content: <p>"ENOUGH!" Rupert shouts and puts you off.<Pause ms={SHORT_PAUSE * 0.5} /> Just as you were gearing up for a second verse</p>,
                                                        performer: performers[PerformerNames.RUPERT],
                                                        includeContinuePrompt: true,
                                                        selectFollowup: debtChallenge
                                                    });
                                                },
                                                shorthandContent: <p>Sing!</p>
                                            }
                                        ],
                                        shorthandContent: <p>{PerformerNames.RUPERT} has to be stopped!</p>
                                    },
                                    {
                                        content: <p>...</p>,
                                        performer: playerPerformer,
                                        selectFollowup: debtChallenge,
                                        shorthandContent: <p>Let it go</p>,
                                        includeContinuePrompt: true
                                    }
                                ]
                            })
                        },
                        performer: playerPerformer,
                        includeContinuePrompt: true,
                        shorthandContent: <p>"We do not need a state to establish trust"</p>
                    }
                ]
            }
        });
    }

    const debtChallenge = () => {
        addMessage({
            content: (
                <>
                <p>"You are all already in debt!"<Pause ms={SHORT_PAUSE} /></p>
                <p>"Just because you've <b>forgotten</b> about it, doesn't mean you don't have to pay it!"<Pause ms={SHORT_PAUSE} /></p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"Our very existence is a debt to God" a man agrees.<Pause ms={SHORT_PAUSE * 0.5} /> He is dressed in a priest's robe<Pause ms={SHORT_PAUSE} /></p>,
            performer: performers[PerformerNames.FRANCIS]
        });

        addMessage({
            content: <p>"And it is repaid in service of the Nation"</p>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        //TODO: add some choices to debt discussion

        addMessage({
            content: <p>"Look around you. This was built for you by your ancestors. <Pause ms={SHORT_PAUSE} />You repay your debt to them for building this by respecting their traditions"</p>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"Did our ancestors build this Agora?"<Pause ms={SHORT_PAUSE} /></p>,
            performer: performers[PerformerNames.DOUGLAS],
            getResponses: rupertConclusion
        })
    }

    const rupertConclusion = (rupertAsked: boolean = false) => {
        let choices = [
            {
                content: (
                    <>
                    <p>You fill your lungs with air and stand straight.</p><Pause ms={SHORT_PAUSE * 0.5} />
                    <Text color={INTUITION_COLOUR}>You are projecting such a lionesque dominance that everyone is watching you, silent.</Text>
                    <Pause ms={LONG_PAUSE} />
                    <p>"My liege, forgive me to be telling you this but you mistake yourself"</p><Pause ms={SHORT_PAUSE} />
                    <p>"Look at the uniform of these men" making eye contact with each citizen in the crowd in turn.</p><Pause ms={SHORT_PAUSE} />
                    <p>"This is not the uniform worthy of a mayor's troop,<Pause ms={SHORT_PAUSE * 0.25} /> NAE!"</p>
                    </>
                ),
                selectFollowup: crownRupertKing,
                performer: playerPerformer,
                includeContinuePrompt: true,
                shorthandContent: <p>Crown {PerformerNames.RUPERT} King</p>
            },
            {
                content: (
                    <>
                    <p>"This man <b>is</b> an impostor! Worse still he is a leech!"</p><Pause ms={SHORT_PAUSE} />
                    <p>"If you ask me then I say we're better off without him!</p>
                    <Pause ms={SHORT_PAUSE * 1.25} />
                    <p>"All power to the People!<Pause ms={SHORT_PAUSE * 0.25} /> All power to the <em>Polis</em>!"</p>
                    </>
                ),
                selectFollowup: exileRupert,
                performer: playerPerformer,
                includeContinuePrompt: true,
                shorthandContent: <p>Banish the impostor</p>
            }
        ];

        if(hasRelationshipStrongerThan(PerformerNames.RUPERT, Relationships.TRUST, 0) && !rupertAsked) {
            choices.push({
                content: (
                    <>
                    <p>"Your Grace" you propose softly<Pause ms={SHORT_PAUSE} />. Your voice is soft and sweet like a song<Pause ms={SHORT_PAUSE} /></p>
                    <p>"Permit us in your wise benevolence<Pause ms={SHORT_PAUSE * 0.5} /> to recommence our discussions under your supervision?"</p>
                    </>
                ),
                includeContinuePrompt: true,
                performer: playerPerformer,
                selectFollowup: () => {
                    if(hasRelationshipWeakerThan(PerformerNames.BURLY, Relationships.TRUST, -1)) {
                        addMessage({
                            content: <Text color={INTUITION_COLOUR}>Burly does not trust you</Text>,
                            performer: performers[PerformerNames.BURLY],
                            includeContinuePrompt: true
                        });
                    }

                    addMessage({
                        content: <p>"I <em>am</em> benevolent"<Pause ms={SHORT_PAUSE} /> Rupert admits, chewing it over slowly</p>,
                        performer: performers[PerformerNames.RUPERT],
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: <p>...<Pause ms={LONG_PAUSE} /> "But I will not permit sedition"</p>,
                        performer: performers[PerformerNames.RUPERT],
                        getResponses: () => rupertConclusion(true)
                    });
                },
                shorthandContent: <p>Appeal to the mayor to permit the agora</p>
            });
        }

        return choices
    }

    const crownRupertKing = () => {
        addMessage({
            content: <p>The burly man makes a motion to interrupt you but he is silenced by his boss.</p>,
            performer: performers[PerformerNames.BURLY],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"This man... was KING!"</p>
                <Pause ms={SHORT_PAUSE * 1.25} />
                <p>There is a collective gasp.</p>
                </>
            ),
            performer: playerPerformer,
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"It is God's will that he rule over us.<Pause ms={SHORT_PAUSE} /> When we excercise our activity to his will, we are also exercising our activity to God's will!"</p>,
            performer: playerPerformer,
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>{PerformerNames.RUPERT} is grinning very widely</p>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <Pace ms={SLOW_PACE * 2}><Text>They seem to be buying it!</Text></Pace><Pause ms={SHORT_PAUSE} />
                <Text color="#FFBF00">It must be the sensational <em>authority</em> that you're projecting.</Text>
                </>
            ),
            performer: playerPerformer,
            includeContinuePrompt: true,
            sideEffect: () => {
                addRelationship("self", buildRelationshipObject(SelfIdentityLabels.AUTHORITY, 1));
            }
        });

        addMessage({
            content: <p>The crowd turns in favour, and the dubious claim of Mayor Rupert becomes the <em>truth</em> of King Rupert.</p>,
            performer: playerPerformer,
            includeContinuePrompt: true,
            sideEffect: () => {
                setWorldItem(World.GOVERNANCE, GovernanceStates.MONARCHY);
                addRelationship(PerformerNames.RUPERT, buildRelationshipObject(Relationships.TRUST, 10));
                addRelationship(PerformerNames.BURLY, buildRelationshipObject(Relationships.TRUST, 1));
                setWorldItem("name", "Rupertston");
                setWorldItem(World.RULER, PerformerNames.RUPERT);
            }
        });

        addMessage({
            content: <RelationshipIndicator color="#ff5dcb"><p>King {PerformerNames.RUPERT}'s eyes have started to sparkle whenever he looks at you.</p></RelationshipIndicator>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>Mari's face is a picture of her lost utopia.</p><Pause ms={SHORT_PAUSE} />
                <p>"But..."</p><Pause ms={SHORT_PAUSE * 0.5} />
                <p>The cheers of the crowd drown her out</p>
                </>
            ),
            performer: performers[PerformerNames.MARI]
        });

        addMessage({
            content: (
                <>
                <p>"Long live the King!"</p>
                <p>"Long live the King!"</p>
                </>
            ),
            performer: performers[PerformerNames.ZOE]
        });

        addMessage({
            content: <p>"Long live the King!"</p>,
            performer: performers[PerformerNames.ALICIA],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>The King and his men are gazing at you in stupified admiration.</p><Pause ms={SHORT_PAUSE} />
                <p>"You did good out there, old sport!"</p><Pause ms={SHORT_PAUSE} />
                <p>"Your ambition is remarkable"</p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>He turns to the crowd and hushes them to silence</p><Pause ms={SHORT_PAUSE * 1.5} />
                <p>"In my grace, I will allow this meeting to continue.<Pause ms={SHORT_PAUSE} /> Henceforth my <em>court</em> is in open session!"<Pause ms={SHORT_PAUSE * 1.25} /></p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT]
        });

        addMessage({
            content: <p>"You there, peasant! <Pause ms={SHORT_PAUSE * 0.4} /> Fetch me a throne!"</p>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>Douglas finds a nearby picnic bench and heaves it to the centre of the ampitheatre</p>,
            performer: performers[PerformerNames.DOUGLAS],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>As Rupert takes a seat Burly eagerly bounds over to his side<Pause ms={LONG_PAUSE * 0.8} /></p>,
            performer: performers[PerformerNames.BURLY]
        });

        addMessage({
            content: <p>The new King beckons you to stand on his left<Pause ms={SHORT_PAUSE} /></p>,
            performer: performers[PerformerNames.RUPERT],
            getResponses: () => {
                return [
                    {
                        performer: playerPerformer,
                        shorthandContent: <p>[Join Rupert loyally]</p>,
                        selectFollowup: () => introduceLeopald(true)
                    },
                    {
                        performer: playerPerformer,
                        shorthandContent: <p>[Join Rupert reluctantly]</p>,
                        sideEffect: () => addRelationship(PerformerNames.BURLY, buildRelationshipObject(Relationships.TRUST, -1)),
                        selectFollowup: () => introduceLeopald(true)
                    }
                ];
            }
        })
    }

    const exileRupert = () => {
        addMessage({
            content: (
                <>
                <p>Just a few at first, then the crowd, chant in unison:</p><Pause ms={SHORT_PAUSE * 0.25} />
                <p>"Long live the Polis!"</p><Pause ms={SHORT_PAUSE * 0.25} />
                <p>"Long live the Polis!"</p><Pause ms={SHORT_PAUSE * 0.25} />
                </>
            ),
            performer: performers[PerformerNames.ZOE]
        });

        addMessage({
            content: <p>"Long live the Polis!"<Pause ms={SHORT_PAUSE * 0.25} /></p>,
            performer: performers[PerformerNames.ALICIA]
        })

        addMessage({
            content: <p>"Long live the Polis!"</p>,
            performer: performers[PerformerNames.MARI],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>The would-be mayor looks around nervously.</p><Pause ms={SHORT_PAUSE * 0.25} />
                <p>Indignant fury crosses his face.</p><Pause ms={SHORT_PAUSE * 0.25} />
                <p>"You <b><em>need</em></b> me"</p><Pause ms={SHORT_PAUSE * 0.25} />
                <p>The crowd does not hear him through the chanting.</p><Pause ms={LONG_PAUSE * 1.5} />
                <p>His protests become increasingly desparate.</p>
                <p>He throws a sharp look to the his lead guard.</p><Pause ms={SHORT_PAUSE * 0.25} />
                <p>"Burly. <Pace ms={SLOW_PACE}><em>Do something</em></Pace>"</p>
                </>
            ),
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"Get 'em men!"</p>
                <p>He lifts a proud fist into the air to accompany the command.</p>
                <Pause ms={LONG_PAUSE} />
                <p>Nothing happens.</p>
                <Pause ms={SHORT_PAUSE} />
                <p>Burly looks about him, most of his men have gone.</p>
                <p>Those who remain are chanting with the others.</p>
                </>
            ),
            performer: performers[PerformerNames.BURLY]
        });

        addMessage({
            content: (
                <>
                <p>"Long live the Polis!"</p>
                </>
            ),
            performer: performers[PerformerNames.AXEL],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>Burly and the would-be mayor beat a slow retreat from the crowd.</p>,
            performer: performers[PerformerNames.RUPERT],
            getResponses: () => {
                return [
                    {
                        content: (
                            <>
                            <p>"Yeah you better run! And your outfits are terrible!"</p>
                            <Pause ms={SHORT_PAUSE * 1.25} />
                            <Text color={INTUITION_COLOUR}>You can hear the wound from here.</Text>
                            </>
                        ),
                        shorthandContent: <Text>Mock them as they leave</Text>,
                        performer: playerPerformer,
                        includeContinuePrompt: true,
                        selectFollowup: () => rupertIsExiled()
                    },
                    {
                        content: <Text>...</Text>,
                        shorthandContent: <Text>[Say Nothing]</Text>,
                        performer: playerPerformer,
                        includeContinuePrompt: true,
                        selectFollowup: () => rupertIsExiled()
                    }
                ]
            },
            sideEffect: () => {
                setWorldItem(World.GOVERNANCE, GovernanceStates.AGORA);
                addRelationship(PerformerNames.RUPERT, buildRelationshipObject(Relationships.TRUST, -10));
                addRelationship(PerformerNames.BURLY, buildRelationshipObject(Relationships.TRUST, -10));
                addRelationship(PerformerNames.RUPERT, buildRelationshipObject(Relationships.EXILED, 1));
                addRelationship(PerformerNames.BURLY, buildRelationshipObject(Relationships.EXILED, 1));
            }
        });
    }

    const rupertIsExiled = () => {
        addMessage({
            content: (
                <>
                <p>"Yeeeahh!"</p>
                <Text color={INTUITION_COLOUR}>Mari is elated as she watches the exiled pretenders flee.</Text>
                <Pause ms={SHORT_PAUSE} />
                <p>"Long live the Polis!"</p>
                <Pause ms={SHORT_PAUSE} />
                </>
            ),
            performer: performers[PerformerNames.MARI],
        });

        addMessage({
            content: <Text color={INTUITION_COLOUR}>Rupert is looking over his shoulder as he leaves, his face is a picture.</Text>,
            performer: performers[PerformerNames.RUPERT],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"This is such an <Pause ms={SHORT_PAUSE * 0.25} /><em>exhillarating</em> feeling!"</p>
                <Pause ms={SHORT_PAUSE} />
                <p>"There is no burden of power over us, no burden of tradition behind us" she says with a long <Pace ms={SLOW_PACE * 0.75}>sigh.</Pace></p>
                <Pause ms={SHORT_PAUSE * 0.5} />
                <p>"We are held back only by the capabilities of our language and the limits of our abilities"</p>
                <Pause ms={SHORT_PAUSE} />
                <p>"We are the masters of our own destiny"</p>
                </>
            ),
            performer: performers[PerformerNames.MARI],
            sideEffect: () => {
                removeRelationship(PerformerNames.MARI, buildRelationshipObject(Relationships.TRUST, 0));
                addRelationship(PerformerNames.MARI, buildRelationshipObject(Relationships.TRUST, 2));
            },
            includeContinuePrompt: true
        });

        if(hasRelationshipPair("self", SelfIdentityLabels.HAS_GREENSIGHT)) {
            addMessage({
                content: <Text color={INTUITION_COLOUR}>{PerformerNames.MARI} looks to you as an ally</Text>,
                performer: performers[PerformerNames.MARI],
                includeContinuePrompt: true
            })
        }

        introduceLeopald();
    }

    const introduceLeopald = (rupertKing: boolean = false) => {
        if(rupertKing) {
            addMessage({
                content: <p>"My people! Come to me with your problems.<Pause ms={SHORT_PAUSE * 0.8} /> I will rule on them fairly and <b>absolutely</b>!"</p>,
                performer: performers[PerformerNames.RUPERT],
                includeContinuePrompt: true
            });
        }

        let douglasExtraContent = rupertKing ? "We may be the masters of our own destiny." : "You said that we're the masters of our own destiny.";

        addMessage({
            content: (
                <>
                <p>"Are we ready for this?"</p><Pause ms={SHORT_PAUSE} />
                <p>{PerformerNames.DOUGLAS} gestures around him</p><Pause ms={SHORT_PAUSE} />
                <p>"We <Pause ms={SHORT_PAUSE * 0.3} /><Pace ms={FAST_PACE * 0.5}>- our ancestors - </Pace><Pause ms={SHORT_PAUSE * 0.3} />surely built this city,<Pause ms={SHORT_PAUSE * 0.5} />, and we don't even remember <em>how</em> we did it"</p>
                </>
            ),
            performer: performers[PerformerNames.DOUGLAS],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>{douglasExtraContent} <Pause ms={SHORT_PAUSE} /> But how can we ensure that we are not just masters of our own peril<Pace ms={SLOW_PACE}>...</Pace> if not by following from tradition?"</p>,
            performer: performers[PerformerNames.DOUGLAS],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"Yes!" a man shouts, all in a rush.</p><Pause ms={SHORT_PAUSE} />
                <p>"These are my concerns exactly"</p>
                </>
            ),
            performer: performers[PerformerNames.LEOPALD],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"My name is <b>Leopald</b>.<Pause ms={SHORT_PAUSE * 0.9} /> I am a general in the {rupertKing ? "Royal" : ""} <em>army</em>"</p>,
            performer: performers[PerformerNames.LEOPALD],
            includeContinuePrompt: true
        });

        addMessage({
            content: <p>"Here, now, when all this is so fresh, <em>of course</em> we will all co-operate with eachother but<Pace ms={SLOW_PACE * 1.25}>...</Pace> a week from now? <Pause ms={SHORT_PAUSE} />A month?"</p>,
            performer: performers[PerformerNames.LEOPALD],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"It's been a meagre <b>{world.daysSinceGreatPop} days</b> since the Big Pop.<Pause ms={LONG_PAUSE} /> I've flicked through some of the <b>history books</b> I found down by the library"</p>
                <Pause ms={LONG_PAUSE * 0.75} />
                <p>"Do you know what I saw?"</p>
                </>
            ),
            performer: performers[PerformerNames.LEOPALD],
            includeContinuePrompt: true
        });

        addMessage({
            content: (
                <>
                <p>"I've only flicked through and looked at the pictures but<Pace ms={SLOW_PACE}>...</Pace>"</p><Pause ms={SHORT_PAUSE * 0.8} />
                <p>"I saw a lot of pain and suffering.<Pause ms={SHORT_PAUSE * 0.5} /> Soldiers and wars, famines and plagues.<Pause ms={SHORT_PAUSE * 0.5} /> Most of it was <em>man-made</em>"</p>
                </>
            ),
            performer: performers[PerformerNames.LEOPALD],
            includeContinuePrompt: true
        });

        if(hasRelationshipPair("self", SelfIdentityLabels.HAS_GREENSIGHT)) {
            addMessage({
                content: <p>There is a look of deep concern on Douglas' face.<Pause ms={SHORT_PAUSE} /> He is engrossed by the potential lessons of history</p>,
                performer: performers[PerformerNames.DOUGLAS],
                includeContinuePrompt: true
            });
        }

        addMessage({
            content: (
                <>
                <p>"I think that it's clear that we need to establish a strong <b>state apparatus</b> to help ensure that we do not revert into a state of chaos"</p>
                { rupertKing ? <p>"At its' head, of course, our wise King"</p> : null }
                <Pause ms={SHORT_PAUSE} />
                </>
            ),
            performer: performers[PerformerNames.LEOPALD],
            getResponses: () => respondingToRupertsInitialQuestion()
        });
    }

    const respondingToRupertsInitialQuestion = (failedAnarchyCheck: boolean = false, askedAboutWorldState: boolean = false) => {
        const choices: IMessage[] = [];

        if(!askedAboutWorldState) {
            choices.push({
                performer: playerPerformer,
                content: <p>"Did the Old World have a state apparatus?"</p>,
                selectFollowup: () => {
                    addMessage({
                        content: <p>"I don't recall" Leopald answers evasively.<Pause ms={LONG_PAUSE} /> "But if they did, it certainly wasn't strong enough!"</p>,
                        performer: performers[PerformerNames.LEOPALD],
                        includeContinuePrompt: true
                    });

                    addMessage({
                        content: (
                            <>
                            <p>"If the Old World needed to use some force to make things fit into a certain way<Pace ms={SLOW_PACE}>...</Pace> maybe it was necessary?" Douglas suggests<Pause ms={SHORT_PAUSE} /></p>
                            {hasRelationshipPair("self", SelfIdentityLabels.HAS_GREENSIGHT) ? <Text color={INTUITION_COLOUR}>Douglas' words are said through significant discomfort<Pause ms={SHORT_PAUSE} /></Text> : null}
                            </>
                        ),
                        performer: performers[PerformerNames.DOUGLAS],
                        sideEffect: () => {
                            addRelationship(PerformerNames.DOUGLAS, buildRelationshipObject(Relationships.NOSTALGIA, -1));
                        },
                        getResponses: () => respondingToRupertsInitialQuestion(failedAnarchyCheck, true)
                    });
                }
            });
        }

        choices.push({
            content: (
                <>
                <p>"There are a wide variety of <b>dangerous people</b> who would do us harm"<Pause ms={SHORT_PAUSE} /></p>
                <p>"To an extent we are all potentially dangerous.<Pause ms={SHORT_PAUSE} /> The only way to ensure that we are all civil is to coerce us in line"</p>
                </>
            ),
            performer: playerPerformer,
            includeContinuePrompt: true,
            sideEffect: () => addRelationship("self", buildRelationshipObject(Values.ORDER, 1)),
            selectFollowup: () => {
                if(world[World.RULER] == PerformerNames.RUPERT) {
                    addMessage({
                        content: <p>"To maintain the Kings' peace, some force must be necessary" Rupert agrees with a sympathetic tone.</p>,
                        performer: performers[PerformerNames.RUPERT],
                        includeContinuePrompt: true
                    });
                }

                prisonDilemma();
            },
            shorthandContent: <p>"People must be kept in line, for our own protection"</p>,
        }, {
            includeContinuePrompt: true,
            selectFollowup: () => {
                addMessage({
                    content: <p>"This, surely, is the only justification of force" Leopald agrees.<Pause ms={LONG_PAUSE} /></p>,
                    performer: performers[PerformerNames.LEOPALD]
                });

                if(world[World.RULER] == PerformerNames.RUPERT) {
                    addMessage({
                        content: <p>And the essence of a King's divine right<Pause ms={LONG_PAUSE} /></p>,
                        performer: performers[PerformerNames.LEOPALD]
                    });
                }

                addMessage({
                    content: <p>"The State has the power to coerce those who will not bend"</p>,
                    performer: performers[PerformerNames.LEOPALD],
                    includeContinuePrompt: true,
                    sideEffect: () => addRelationship("self", buildRelationshipObject(Values.ORDER, 1))
                });

                prisonDilemma();
            },
            shorthandContent: <p>"A state is necessary, but only to ensure that the People's will is carried out"</p>,
            performer: playerPerformer
        });

        if(!failedAnarchyCheck) {
            choices.push({
                selectFollowup: () => {
                    if(world[World.RULER] == PerformerNames.RUPERT) {
                        addMessage({
                            content: (
                                <>
                                <p>Rupert begins to cough uncontrollably.</p><Pause ms={SHORT_PAUSE * 1.5} />
                                <p>"And what about the <Pace ms={SLOW_PACE * 3}><em>tyranny</em></Pace> of <b>sedition</b>?!<Pause ms={SHORT_PAUSE * 0.25} /> No. <Pause ms={SHORT_PAUSE * 0.25} />Unacceptable"</p>
                                </>
                            ),
                            performer: performers[PerformerNames.RUPERT],
                            getResponses: () => respondingToRupertsInitialQuestion(true, askedAboutWorldState)
                        })
                    }
                    else {
                        addMessage({
                            content: <p>{PerformerNames.MARI} is nodding in agreement<Pause ms={SHORT_PAUSE} /></p>,
                            performer: performers[PerformerNames.MARI]
                        });

                        addMessage({
                            content: <p>"But there may be times where we <Pace ms={SLOW_PACE * 4}><em>have</em></Pace> to use force, to defend our liberty" a man complains</p>,
                            performer: performers[PerformerNames.ANDREW],
                            includeContinuePrompt: true
                        });

                        addMessage({
                            content: <p> "We can always use force later, if we have to.<Pause ms={SHORT_PAUSE} /> But we cannot un-use force" another observes<Pause ms={LONG_PAUSE} /></p>,
                            performer: performers[PerformerNames.FRANCIS]
                        });

                        addMessage({
                            content: <p>"We do not need to <b>institutionalise</b> violence" {PerformerNames.MARI} agrees</p>,
                            performer: performers[PerformerNames.MARI],
                            includeContinuePrompt: true
                        });

                        prisonDilemma();
                    }
                },
                shorthandContent: <p>"People must be free from the State's inherent tyranny!"</p>,
                performer: playerPerformer
            });
        }

        if(world[World.RULER] != PerformerNames.RUPERT) {
            choices.push({
                content: (
                    <>
                    <p>"The violence of the State is detestable!"</p><Pause ms={SHORT_PAUSE} />
                    <p>"Since when was <Pace ms={SLOW_PACE * 4}><b>organised violence</b></Pace> a part of 'how we want to live together'?"</p>
                    </>
                ),
                includeContinuePrompt: true,
                selectFollowup: () => prisonDilemma(),
                shorthandContent: <p>"The violence of the State is detestable!"</p>,
                performer: playerPerformer
            });
        }

        choices.push({
            content: <></>,
            includeContinuePrompt: true,
            selectFollowup: () => {
                addMessage({
                    content: <p>"Pish!" {PerformerNames.MARI} complains<Pause ms={LONG_PAUSE} /></p>,
                    performer: performers[PerformerNames.MARI]
                });

                if(!askedAboutWorldState) {
                    addMessage({
                        content: <p>"I read up on some history too, and they <Pace ms={SLOW_PACE * 4}><em>had</em></Pace> a State apparatus<Pace ms={SLOW_PACE * 1.5}>...</Pace><Pause ms={LONG_PAUSE} /></p>,
                        performer: performers[PerformerNames.MARI]
                    });
                }

                addMessage({
                    content: <p>"Since when was <Pace ms={SLOW_PACE * 4}><b>organised violence</b></Pace> a part of 'how we want to live together'?"</p>,
                    performer: performers[PerformerNames.MARI],
                    includeContinuePrompt: true
                });

                prisonDilemma();
            },
            shorthandContent: <p>[Say Nothing]</p>,
            performer: playerPerformer
        });
        
        return choices
    }

    const prisonDilemma = () => {
        if(!hasRelationshipPair("self", Values.ORDER)) {
            addMessage({
                content: <p>"My dear you're being <b>naïve</b>"</p>,
                performer: performers[PerformerNames.LEOPALD],
                includeContinuePrompt: true
            });
        }

        if(hasRelationshipPair("self", SelfIdentityLabels.HAS_GREENSIGHT)) {
            addMessage({
                content: <p>"It only takes one <b>murderer</b> to spoil a <b>picnic</b>"</p>,
                performer: performers[PerformerNames.LEOPALD],
                includeContinuePrompt: true
            });

            addMessage({
                content: <Text color={INTUITION_COLOUR}>Leopald introduced himself as a <b>general</b>, you recall.<Pause ms={SHORT_PAUSE} /> He is a military man and sees society through a military lens<Pause ms={LONG_PAUSE} /></Text>,
                performer: playerPerformer,
                getResponses: () => murdererQuestion()
            });
        }
        else {
            addMessage({
                content: <p>"It only takes one <b>murderer</b> to spoil a <b>picnic</b>"<Pause ms={LONG_PAUSE} /></p>,
                performer: performers[PerformerNames.LEOPALD],
                getResponses: () => murdererQuestion()
            });
        }
    }

    const murdererQuestion = () => {
        return [

        ]
    }

    const prisonIntroduction = () => {
        
    }

    let content = null;

    const introText = (
        <>
        <p>You follow the path which leads downhill, taking care on the slope.</p>
        <p>You come upon a large circular clearing enclosed by the remains of ancient stonework steps, steep and incomplete.</p>
        <Pause ms={LONG_PAUSE} />
        <p>There is a crowd of people here, in between the ruins.</p>
        <p>They are talking as a group with some energy.</p>
        <Pause ms={SHORT_PAUSE} />
        <p>It becomes apparent that you are not the only one who does not remember.</p>
        <p>In fact, nobody does.</p>
        <Pause ms={LONG_PAUSE} />
        <p>The others have been awake for longer, they are discussing what they are supposed to do next.</p>
        </>
    );

    if(!dialogueStarted) content = (
        <>
        {introText}
        <Center marginTop={10}>
            <Button onClick={() => setDialogueStarted(true)}>Continue</Button>
        </Center>
        </>
    );

    else if(dialogueEnded) {

        let topContent = <p>You leave the park behind.</p>;

        switch(world[World.GOVERNANCE]){
            case GovernanceStates.MONARCHY:
                topContent = <p>{PerformerNames.RUPERT} leads his procession out of the park, followed by tens of his newly loyal subjects. Others are wandering around the old arena aimlessly. The agora is dead.</p>;
                break;
            case GovernanceStates.MILITARY_CONSULATE:
                break;
        }

        content = (
            <>
                {topContent}
                <Button onClick={() => followLink("map")}>Continue</Button>
            </>
        );   
    }

    else content = (
        <Dialogue>
        </Dialogue>
    );

    return (
        <Container className={shakingClasses ? shakingClasses : ""}>
            <WindupChildren>
                {content}
            </WindupChildren>
        </Container>
    );
}

export default function Agora({followLink} : IStoryFrame): React.ReactElement {

    return (
        <DialogueProvider>
            <AgoraDialogue followLink={followLink}/>
        </DialogueProvider>
    );
}