
import americanGovernment from './canonicalBookMap/americanGovernment';
import biology from './canonicalBookMap/biology';
import chemistry from './canonicalBookMap/chemistry';
import chemistryAF from './canonicalBookMap/chemistryAF';
import economics from './canonicalBookMap/economics';
import elementaryAlgebra from './canonicalBookMap/elementaryAlgebra';
import intermediateAlgebra from './canonicalBookMap/intermediateAlgebra';
import macroeconomics from './canonicalBookMap/macroeconomics';
import macroeconomicsAP from './canonicalBookMap/macroeconomicsAP';
import microeconomics from './canonicalBookMap/microeconomics';
import microeconomicsAP from './canonicalBookMap/microeconomicsAP';
import physicsAP from './canonicalBookMap/physicsAP';
import preAlgebra from './canonicalBookMap/preAlgebra';
import sociology from './canonicalBookMap/sociology';

export const CANONICAL_MAP: CanonicalBookMap = {
  ...americanGovernment,
  ...economics,
  ...elementaryAlgebra,
  ...biology,
  ...chemistry,
  ...chemistryAF,
  ...intermediateAlgebra,
  ...macroeconomics,
  ...microeconomics,
  ...microeconomicsAP,
  ...macroeconomicsAP,
  ...physicsAP,
  ...preAlgebra,
  ...sociology,
  /* Algebra & Trigonometry 2e */ 'eaefdaf1-bda0-4ada-a9fe-f1c065bfcc4e' : [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
    /* Precalculus 2e */ ['f021395f-fd63-46cd-ab95-037c6f051730', {}],
  ],
  /* Algebra & Trigonometry */ '13ac107a-f15f-49d2-97e8-60ab2e3b519c' : [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
    /* Precalculus 2e */ ['f021395f-fd63-46cd-ab95-037c6f051730', {}],
    /* Algebra & Trigonometry 2e */ ['eaefdaf1-bda0-4ada-a9fe-f1c065bfcc4e', {}],
  ],
  /* Anatomy & Physiology */ '14fb4ad7-39a1-4eee-ab6e-3ef2482e3e22': [
    /* Anatomy & Physiology 2e */ ['4fd99458-6fdf-49bc-8688-a6dc17a1268d', {}],
  ],
  /* Astronomy */ '2e737be8-ea65-48c3-aa0a-9f35b4c6a966': [
    /* Astronomy 2e */ ['4c29f9e5-a53d-42c0-bdb5-091990527d79', {}],
  ],
  /* Organizational Behavior */ '2d941ab9-ac5b-4eb8-b21c-965d36a4f296': [
    /* Principles of Management */['c3acb2ab-7d5c-45ad-b3cd-e59673fedd4e', {}],
  ],
  /* College Algebra */ '9b08c294-057f-4201-9f48-5d6ad992740d': [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
  ],
  /* College Algebra with Corequisite Support 2e */ '59024a63-2b1a-4631-94c5-ae275a77b587': [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
  ],
  /* College Algebra with Corequisite Support */ '507feb1e-cfff-4b54-bc07-d52636cecfe3': [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
    /* College Algebra with Corequisite Support 2e */ ['59024a63-2b1a-4631-94c5-ae275a77b587', {}],
  ],
  /* Psychology */ '4abf04bf-93a0-45c3-9cbc-2cefd46e68cc' : [
    /* Psychology 2e */ ['06aba565-9432-40f6-97ee-b8a361f118a8', {
      /* Preface to the same module in 2e */
      '17f9a360-57e1-4c3e-82f5-f9328ca23f04': 'd7336d3e-34f2-4b2c-a636-b7afd47f0efd',
      /* 1.0 Introduction to the same module in 2e */
      'e87a0b1b-e4c0-4384-a515-85793a99d551': 'b1560428-7264-4e92-8d43-da96b5d9bd87',
      /* 1.1 What is Psychology? to the same module in 2e */
      'f899805c-f3a3-4c8b-913b-8b4408f3054e': '7b83ef15-2214-44fe-85cb-912ed21c75bc',
      /* 1.2 History of Psychology to the same module in 2e */
      '940601bd-564c-444d-9952-9d44f82cf324': '73a4e3b4-c883-4dad-a47f-86ac0d3bfb8b',
      /* 1.3 Contemporary Psychology to the same module in 2e */
      'b441f14d-1a24-4127-b289-2db6ea1ec9da': 'b1926b98-3b49-4b56-ad00-73da7844bca3',
      /* 1.4 Careers in Psychology to the same module in 2e */
      '88b91a3d-2d45-45d7-af61-43a77f31b1f4': '13752615-28a0-42dd-953a-a1608c5e8026',
      /* 2.0 Introduction to the same module in 2e */
      '40abd33e-8e83-4a09-8556-f489d4e29c34': '3c79e138-923d-4606-8d02-24b8ce2f0afb',
      /* 2.1 Why is Research Important? to the same module in 2e */
      '1e9e7330-5601-4832-9407-ea89af15113e': '1db17970-a37e-48e8-b20c-941b52ce73ef',
      /* 2.2 Approaches to Research to the same module in 2e */
      '88cc8564-9ce0-45f2-958c-5ccab289f902': '39351c07-aca5-44e0-9276-f83f2893145a',
      /* 2.3 Analyzing Findings to the same module in 2e */
      '99f02bc9-bc9e-405a-b300-2197f3ce3e96': '44e86fdd-1b17-4e86-8c8b-945230d8133a',
      /* 2.4 Ethics to the same module in 2e */
      '598b46d7-bb47-43f0-bb34-f1e90a3ebeb8': '027c2589-b86d-4757-bfc8-907794add350',
      /* 3.0 Introduction to the same module in 2e */
      '7891a425-fdd6-4fdf-b5fa-4b4d948c1524': '2d810341-0673-49f1-b8ba-485c99e04baa',
      /* 3.1 Human Genetics to the same module in 2e */
      'bd0a70f3-ce1b-4656-8551-69afb19415e0': '781cf445-32ee-4d92-ab0d-fe2967ba4803',
      /* 3.2 Cells of the Nervous System to the same module in 2e */
      '48edae7e-72a6-417b-a426-4353a717d577': 'cec4ceec-8232-473d-b4b7-405524a93eac',
      /* 3.3 Parts of the Nervous System to the same module in 2e */
      'fb1b3b55-ef15-44f3-9d52-df597ba53b4d': '2c452232-1bb2-4d26-a412-96ee84ff2a89',
      /* 3.4 The Brain and Spinal Cord to the same module in 2e */
      'fc8a38cc-fd1c-44cc-b91d-726fcfa62165': 'be055ac9-f86d-41fd-926a-274645c57e1c',
      /* 3.5 The Endocrine System to the same module in 2e */
      'df8a0598-0c65-4379-89ce-928ec2ed293f': '97a0ac4e-f79f-4413-9308-feb05fdecc3b',
      /* 4.0 Introduction to the same module in 2e */
      'cf2c2f40-e252-44fb-bb6b-9ffb5ee64f00': 'fe73a461-3667-4a3f-819b-ba35f8cbe728',
      /* 4.1 What Is Consciousness? to the same module in 2e */
      'b5e7f2ec-4e9c-467d-82cc-e0a5f8a35487': 'f7244366-506e-4e2c-a183-cf134667d1e2',
      /* 4.2 Sleep and Why We Sleep to the same module in 2e */
      '1c14e4d3-a6df-4481-be4f-4395914859ab': '3b74edc2-ba75-4070-bd97-f344d29dd8a2',
      /* 4.3 Stages of Sleep to the same module in 2e */
      '1b88b415-8df3-4b05-9bfa-3b914124d54e': 'fea79b76-b417-40e2-8ab8-35161b0c4f3e',
      /* 4.4 Sleep Problems and Disorders to the same module in 2e */
      '32ad8e27-9a0a-4919-8886-5fbcbb79796e': '4ffb3e5b-9fb7-46e5-9928-20802d505e38',
      /* 4.5 Substance Use and Abuse to the same module in 2e */
      '7ce53544-6c61-4443-9c02-235ca5be5c1c': '937511e1-4e12-4a50-82de-e55fdcc804bb',
      /* 4.6 Other States of Consciousness to the same module in 2e */
      'f89ed0da-ebf5-46d7-ad62-5d0815e5d88a': '43d144b8-e8c9-46b7-9283-63c840cf4e42',
      /* 5.0 Introduction to the same module in 2e */
      '48f9baed-1753-4e77-a26d-36de141b38e9': 'dd4bd0e8-0fd3-48b5-8ecd-a0345543e585',
      /* 5.1 Sensation versus Perception to the same module in 2e */
      '2be0d9fb-4dcf-4848-bd06-a5f646c0e496': '76abf095-1e5c-4f55-97ca-ba9b7f65bdf1',
      /* 5.2 Waves and Wavelengths to the same module in 2e */
      'd4289ca7-a08e-46e7-9aa2-29feb5e2ffd9': 'd7568e9f-481b-4a1b-a70f-598fa16ca29a',
      /* 5.3 Vision to the same module in 2e */
      '13eeec2d-014f-4d49-a6d0-bac8b83dcc71': '6f989101-5c8a-4e10-8b2a-6958cccc83a8',
      /* 5.4 Hearing to the same module in 2e */
      'd2729fa5-7a9b-42c8-acf8-53f07c0e9f2a': '988ad23a-408d-4f22-ba91-ea81e2d6c7eb',
      /* 5.5 The Other Senses to the same module in 2e */
      '370f4538-a2ec-4bf7-a3f4-c00b15548c04': '86d07238-999a-4449-8e26-277086d7e224',
      /* 5.6 Gestalt Principals of Perception to the same module in 2e */
      '70e73101-1feb-4607-b747-cd1926a9f015': '2f2f5214-14eb-4eab-a406-9aa7047c9d90',
      /* 6.0 Introduction to the same module in 2e */
      '35cd3e44-55cd-469a-8815-eca777685fab': '0eca020a-7f8b-42dd-b10a-eb214de1cbbd',
      /* 6.1 What Is Learning? to the same module in 2e */
      '40dc9792-23fb-4394-b059-58abc395a76f': '76c84bee-638f-4693-acc7-46510fb54f1f',
      /* 6.2 Classical Conditioning to the same module in 2e */
      '8525bfc0-820f-4b5d-8b0f-786f94d468dc': '3803c294-140b-4680-afe2-e3295f88f591',
      /* 6.3 Operant Conditioning to the same module in 2e */
      'af8ef404-215b-4421-a5f7-88343e2129d8': 'f94ebca0-5648-477e-92eb-604266b18087',
      /* 6.4 Observational Learning (Modeling) to the same module in 2e */
      'b5043fe6-b461-4abb-b9ec-8d5de2bb50d8': '79e18803-3d15-4273-bacb-2ba66b142b6c',
      /* 7.0 Introduction to the same module in 2e */
      'dc34f45c-17ca-4e69-a106-b6338a5ede3b': '4f90719a-ac25-4271-a76a-4835d922fbcc',
      /* 7.1 What Is Cognition? to the same module in 2e */
      'bbc32517-1050-4d66-bba3-97ba982c6e60': 'b7a1966c-4eb3-4bc6-b32f-25511b2b6910',
      /* 7.2 Language to the same module in 2e */
      'f05e92ad-77c6-4ce5-b040-bcb5afc198ce': '289a0d35-9557-42d3-9937-22b299e067c7',
      /* 7.3 Problem Solving to the same module in 2e */
      '2e4dd89e-fb82-4266-b6fa-5841c3f17762': 'a5032008-aa12-4360-992a-2741ba0b3a73',
      /* 7.4 What Are Intelligence and Creativity? to the same module in 2e */
      '96558f8b-6735-4b2f-9572-66c0d2c68a6d': '84eb4bf0-6aa5-49da-9266-c3d955914da5',
      /* 7.5 Measures of Intelligence to the same module in 2e */
      'f22c928e-aaa2-4a1c-8c4a-138650d11fda': '100b5a6c-4570-465f-bc35-6bb1f77bc6dc',
      /* 7.6 The Source of Intelligence to the same module in 2e */
      '10c13ff1-aa5f-401c-9ba2-cd3d6e41dff9': 'ebc6428a-ef5d-473a-a04f-f81925b3b37d',
      /* 8.0 Introduction to the same module in 2e */
      '9b77f371-741d-4543-9480-cbeb3eb1ee8a': 'd2adf8a6-98e5-4d3c-910e-8ba35e3e1951',
      /* 8.1 How Memory Functions to the same module in 2e */
      'f91c2a41-6ced-4dcd-bb16-929020b9db27': '6b17f8a5-2864-40cc-b599-dfba5930ead2',
      /* 8.2 Parts of the Brain Involved with Memory to the same module in 2e */
      '2db9bfb7-2a2d-467e-a1b4-63f242a094d9': '41166858-c49d-48d1-b26a-df69e138e1d4',
      /* 8.3 Problems with Memory to the same module in 2e */
      '23dec9dd-37b7-4077-b70d-aa3749666ab7': '1a67a5b9-fd8a-45e1-a5e6-c1d5375e8cd6',
      /* 8.4 Ways to Enhance Memory to the same module in 2e */
      '148d0393-8c31-4c83-b1cd-4e973c989a38': '94a96319-7819-45a7-885f-74680e4aa023',
      /* 9.0 Introduction to the same module in 2e */
      '49bdf021-7122-4796-8680-3c208e263dbc': 'e21e0cd8-24c7-45b7-9d3c-c88dae651b0d',
      /* 9.1 What Is Lifespan Development? to the same module in 2e */
      'fb83c68a-2bc6-4a0a-ba0f-b79ceb75594b': '9cabc16c-94a3-4c52-890d-2023f729f96c',
      /* 9.2 Lifespan Theories to the same module in 2e */
      '11da1ddc-f426-422d-8ce2-19501ca6ebb5': '47bcc5cb-165f-4bdb-a02e-a7e9d3737c46',
      /* 9.3 Stages of Development to the same module in 2e */
      '6fba2998-2177-421e-b38e-db3b4c965c24': 'aa700c98-2a9e-4bb8-b838-6cb4f461d12a',
      /* 9.4 Death and Dying to the same module in 2e */
      'f86a5b2c-a45d-47e0-8f4a-dfecedaa08fc': '58f34689-53e0-4554-a388-c90716cc27eb',
      /* 10.0 Introduction to the same module in 2e */
      '51082f3f-9347-4a45-a6f0-efa82f5b0749': '97b5b6e1-15e6-4df4-9c8b-870c979ffc93',
      /* 10.1 Motivation to the same module in 2e */
      '30b003a9-7322-48e0-b624-a8e751f5ae0d': '8fd12999-908a-48a2-bbe2-e9ca5ed89c87',
      /* 10.2 Hunger and Eating to the same module in 2e */
      'ef2e29f8-8e1a-43d9-ba50-4b1d289d4d97': '11da71af-7c1e-4f5e-8f3c-800901e0c1fa',
      /* 10.3 Sexual Behavior to the same module in 2e */
      'b72bcffc-f362-4645-a335-d3a3305eef64': 'feb32d8d-13b7-497b-8c06-2a31de0e62c8',
      /* 10.4 Emotion to the same module in 2e */
      '09636efc-5f70-477f-8872-c1841382e52d': '9243621a-cb30-4f86-a251-4e35b1266562',
      /* 11.0 Introduction to the same module in 2e */
      '5fb948bf-a7d7-4db4-937f-8a00274164a6': '287622de-e897-46fe-8811-c0cb1720bf16',
      /* 11.1 What Is Personality? to the same module in 2e */
      '6098d267-5492-4f0b-b702-ddf1b83e6049': 'f0dcad58-288b-4312-ade2-4972a3b5e5b3',
      /* 11.2 Freud and the Psychodynamic Perspective to the same module in 2e */
      '2ae07a37-ed2e-4a2f-8ff7-2f27c5bd5de5': '0fba410b-fec3-47b9-a884-dfa72e1a3efd',
      /* 11.3 Neo-Freudians: Adler, Erikson, Jung, and Horney to the same module in 2e */
      'b1ae7f5f-87fc-4b3c-afe9-88802f44514b': '67a2c946-d7f0-4ac2-a944-53e854d8c173',
      /* 11.4 Learning Approaches to the same module in 2e */
      '6d3fe582-ae92-4660-8524-d1ca82f38116': '0d86d540-c162-449a-8e4c-019520f828c4',
      /* 11.5 Humanistic Approaches to the same module in 2e */
      '6c34e2a2-96dc-4cbc-a96b-4ad031f29be2': '6f73583b-38e0-4db0-9c56-074867cde6ab',
      /* 11.6 Biological Approaches to the same module in 2e */
      '06d4f49d-22aa-4ae4-9c3e-207ff8717102': 'debc112e-0ede-4e20-8b5e-a8c6e63ac2d4',
      /* 11.7 Trait Theorists to the same module in 2e */
      '56a6a9cf-0b2d-4ae6-8913-2daa69f401f1': '1dd37b37-828b-4b27-aae3-94cdf35c9b66',
      /* 11.8 Cultural Understandings of Personality to the same module in 2e */
      '5851318c-0233-498c-9ade-172422d42698': 'a4e4cdc9-802c-4494-9558-f3ac1e6530db',
      /* 11.9 Personality Assessment to the same module in 2e */
      '2ec83ba2-1b21-4c28-a019-ca04338891c7': '933b4215-c9f1-4d7d-8f3e-01bcb54b6ee0',
      /* 12.0 Introduction to the same module in 2e */
      '08f827af-5e53-4516-a8c9-86584e693ce9': 'cff88875-4954-4317-9ef5-ee3b4217a1b1',
      /* 12.1 What Is Social Psychology? to the same module in 2e */
      '856a177a-de8a-404d-890f-aca15a9d0fd9': '943c3979-a3c7-4765-a1b8-bb3984b43fc0',
      /* 12.2 Self-Presentation to the same module in 2e */
      'a3e2787e-10c1-4e97-be22-0bd93b609b70': 'c64a3d26-f0f9-40d1-8f4b-3368cbcbf2a1',
      /* 12.3 Attitudes and Persuasion to the same module in 2e */
      '30129bca-b602-49de-ad6d-23c868c999c8': '1d4f147a-fd14-4905-986b-0c7c1588bb7c',
      /* 12.4 Conformity, Compliance, and Obedience to the same module in 2e */
      'f80efb42-fea3-4b06-94cf-a8bdd8f37f20': '9c110682-871f-49c4-b63d-4adc2f73302e',
      /* 12.5 Prejudice and Discrimination to the same module in 2e */
      '9e1a48e1-c52c-4d96-82d5-ca5612c1128d': '1ec73fde-c8a0-4936-94bd-d670127a46fe',
      /* 12.6 Aggression to the same module in 2e */
      '03cd13bc-f295-4015-ae89-ca8e76cf3c30': 'e016963b-f4c3-4e17-b2de-70bb403bd5ee',
      /* 12.7 Prosocial Behavior to the same module in 2e */
      '428c8adb-73d1-4129-a1c1-a71b7ab119da': '17b83c73-d4a6-46d3-a19c-258ea091bb58',
      /* 13.0 Introduction to the same module in 2e */
      '292737fc-41ad-436a-a488-8393012266f4': '10302299-0974-427f-87a3-8c4fb2466656',
      /* 13.1 What Is Industrial and Organizational Psychology? to the same module in 2e */
      'f12d3bb8-3209-42cc-9029-a8c395557a7c': '757606af-0ff1-494b-a8f3-78c3bc16550f',
      /* 13.2 Industrial Psychology: Selecting and Evaluating Employees to the same module in 2e */
      'd40bc7d6-829c-4c49-ab8c-553b904d1624': '534ef096-1ea6-4218-bca9-9508d265bea8',
      /* 13.3 Organizational Psychology: The Social Dimension of Work to the same module in 2e */
      'b0e809ec-0de2-4f50-b4fc-9f5d303592c1': 'e3ee7adf-1b8e-4c10-8347-35e1dea34332',
      /* 13.4 Human Factors Psychology and Workplace Design to the same module in 2e */
      'bc53c2f5-9863-4876-89b4-2ffe03f2de87': 'f692fbea-971b-464c-bd69-d433b2259275',
      /* 14.0 Introduction to the same module in 2e */
      'a0461bab-6b94-48b8-8b77-d4f71d2b7db5': '08024db3-9754-41c0-b446-5fee031792f3',
      /* 14.1 What Is Stress? to the same module in 2e */
      'a729cfdc-f94b-4932-b2e4-0c72524d45a0': '40e12cd2-98c8-46b0-a26e-ccb537f0818d',
      /* 14.2 Stressors to the same module in 2e */
      'e1fb3653-fc0f-4737-9852-b5d5a21b16f7': 'da34903a-2e22-4bdc-932f-848427b06c38',
      /* 14.3 Stress and Illness to the same module in 2e */
      '8b59d26a-7e49-4389-af99-730848757e0c': '578efc6d-395a-4a14-9573-b0a2e6af367b',
      /* 14.4 Regulation of Stress to the same module in 2e */
      '48ac6ebb-54c8-4396-9a92-908995fb6ee1': '2c49856b-d7c7-4309-9ff7-dd5fcd088979',
      /* 14.5 The Pursuit of Happiness to the same module in 2e */
      'dbad3e6f-514a-4f03-9338-93940a6a9a19': '4d8c6157-6b9b-417e-a57b-6e3b6dc240da',
      /* 15.0 Introduction to the same module in 2e */
      '2cc753e2-cc7f-47a7-8bba-2644cf162876': '75757985-e4d8-432b-b996-856d9d9c72f5',
      /* 15.1 What Are Psychological Disorders? to the same module in 2e */
      '06cd86b6-1e28-4861-bfa5-16badaeae8c4': '11fb78f4-eddb-4170-ad6f-0ddb38fd723c',
      /* 15.2 Diagnosing and Classifying Psychological Disorders to the same module in 2e */
      '6b40e06e-a675-407b-86d0-8b486bfb673f': '1cbcdc89-c5b2-47d0-aa74-19821a004d8d',
      /* 15.3 Perspectives on Psychological Disorders to the same module in 2e */
      '7d74e56c-c750-4da5-a42c-50da0e5c5cb2': '1f0cfc12-d0aa-4ae7-835e-c009f48728e8',
      /* 15.4 Anxiety Disorders to the same module in 2e */
      '597edb02-3985-4733-9361-fe046d01ac4f': '11cf4e4c-c7c9-41bd-99b2-54fa266ff2d3',
      /* 15.5 Obsessive-Compulsive and Related Disorders to the same module in 2e */
      'a45eef58-d072-4c7f-a84a-f5fb08299b81': '633c4f16-9466-4f66-aa99-4df94ad85277',
      /* 15.6 Posttraumatic Stress Disorder to the same module in 2e */
      'ba78d778-1e85-4b7c-8db4-4586f776408b': 'c1c294eb-44d4-4b36-a367-5ca22cf97398',
      /* 15.7 Mood Disorders to the same module in 2e */
      '7b8c4a5f-f554-482d-91dc-3884cbd84781': 'b90d6936-46a4-4290-ad14-6fce4996b9da',
      /* 15.8 Schizophrenia to the same module in 2e */
      '8060ffc0-d4de-49d4-8586-1d003430997f': 'a085d57d-394d-4633-988a-b2ea34651a36',
      /* 15.9 Dissociative Disorders to the same module in 2e */
      'c4aef64d-dd62-454c-9bc1-b5a2d315c051': '9e7f6116-8943-49b2-8f6e-1c8a83128a41',
      /* 15.10 Personality Disorders to 15.11 Personality Disorders (switched with 15.11) in 2e */
      '381b56ba-fd11-4deb-88cb-d8c46a7b29a5': '81853cb9-2061-41a8-a76a-fb01996260ef',
      /* 15.11 Disorders in Childhood to 15.10 Disorders in Childhood (switched with 15.10) in 2e */
      'b80499e9-d8c6-4219-84c2-d6f18b5f0d27': 'c4d0e488-22d1-44a2-ab5f-a251c4513432',
      /* 16.0 Introduction to the same module in 2e */
      'aae3ba76-1360-457d-9854-8f69e2122041': 'b14b4a24-196e-41ee-9273-21fd1853a097',
      /* 16.1 Mental Health Treatment: Past and Present to the same module in 2e */
      '15ad2259-0d9e-4832-846f-7985d2bc061f': '357be449-975a-4a14-afa0-23aa01499611',
      /* 16.2 Types of Treatment to the same module in 2e */
      '37c1e376-2e61-4df3-8e03-2a924a270b33': 'b2f517e0-2d03-4bdd-9bc4-8f9118bc6512',
      /* 16.3 Treatment Modalities to the same module in 2e */
      '0953d3ca-1160-4621-8bd8-24ce2530d9c2': '8bffeccd-cf19-4515-91db-2fbcba5d9a5a',
      /* 16.4 Substance-Related and Addictive Disorders: A Special Case to the same module in 2e */
      'e10198bc-f204-4784-a38b-4f639223cc7f': '3433989d-bc20-4202-adc9-e859846a91ea',
      /* 16.5 The Sociocultural Model and Therapy Utilization to the same module in 2e */
      '4f53d6a9-4cb7-4f9c-b0c4-d7cd9d1b5c39': '105b9bcc-d66c-41b9-bde7-a1af090227e5',
      /* References to the same module in 2e */
      'ffc33c5c-9381-50a0-842a-8d3e1238b8c7': '90d79060-d63e-55b7-b333-acc6b90561ca',
    }],
  ],
  /* Preparing for College Success */ '503d9717-0d3a-409f-893e-d25740d237dc': [
    /* College Success Concise */ ['62a49025-8cd8-407c-9cfb-c7eba55cf1c6', {}],
  ],
  /* Introductory Statistics */ '30189442-6998-4686-ac05-ed152b91b9de': [
    /* Introductory Statistics 2e */ ['c4b474e4-4e3b-4232-b35c-2c3535bfae73', {}],
  ],
  /* Introductory Business Statistics */ 'b56bb9e9-5eb8-48ef-9939-88b1b12ce22f': [
    /* Introductory Business Statistics 2e */ ['547026cb-a330-4809-94bf-126be5f62381', {}],
  ],
  /* Introducción a la estadística empresarial */ 'f346fe75-ae39-4d11-ad32-d80c03df58cb': [
    /* Introducción a la estadística */ ['e53d6c8b-fd9e-4a28-8930-c564ca6fd77d', {}],
  ],
  /* Chemistry: Atoms First 2e */ 'd9b85ee6-c57f-4861-8208-5ddf261e9c5f' : [
    /* Chemistry 2e */ ['7fccc9cf-9b71-44f6-800b-f9457fd64335', {
      /* Preface to the same module in 2e */
      '541d7d79-a70e-42c2-b765-d55586648390': '138634ed-6ed0-4edb-b13d-b78d388028b0',
      /* 2.0 Introduction to the same module in 2e */
      '1cb2b2cb-c17a-4cee-b972-13ebc03f7627': 'b49c3d38-7dfb-4979-ba45-12fdd44f2cc8',
      /* 2.1 Early Ideas in Atomic Theory to the same module in 2e */
      'ebfab4d3-9644-41b8-80fc-a67ba47c0f57': '3c9c47d2-06f5-42b3-ba17-2248cc3dd7a9',
      /* 2.2 Evolution of Atomic Theory to the same module in 2e */
      'c3dccc36-8ede-466f-b216-f05018a4e088': 'bd29edc8-a139-456b-bc95-cee49b2fa5b1',
      /* 2.3 Atomic Structure and Symbolism to the same module in 2e */
      '77398b85-782d-4a36-b0a6-a0959dbf9c60': 'e82ac421-e027-4ba2-8c34-2b8bdde7f3dc',
      /* 2.4 Chemical Formulas to the same module in 2e */
      '594e5009-d70c-4101-ae18-4154ff1c7ffd': '9d7d0989-f579-4047-9023-8048341af5de',
      /* 3.0 Introduction to the same module in 2e */
      'fc7f7fc6-4d9f-4956-a5a7-3092ac72182e': 'fc7f7fc6-4d9f-4956-a5a7-3092ac72182e',
      /* 3.1 Electromagnetic Energy to the same module in 2e */
      'd96495d5-09fe-4702-959f-d39a243c2612': '41ea6265-62bd-4d5d-b62f-efc9dea99210',
      /* 3.6 The Periodic Table to the same module in 2e */
      '4d73981f-76cf-43a3-b932-9f68fdf3abf6': '601be624-33cb-45bb-beb8-d069264fae07',
      /* 3.7 Molecular and Ionic Compounds to the same module in 2e */
      'b832199d-447d-4c4b-b05b-af31e4297fa6': 'f1c0d0db-2d56-4a2f-b6cb-2bf649278669',
      /* 4.1 Ionic Bonding to the same module in 2e */
      '15fcaa15-d7e8-4c4b-a448-20ea312b13ff': '30abf24f-5db5-4f44-b275-62908b3f1f4b',
      /* 4.3 Chemical Nomenclature to the same module in 2e */
      'af022e7e-64ba-4771-aca4-0cde75b66925': 'dc382342-b6fe-42b8-9f76-4acc4d8246ce',
      /* 5.0 Introduction to the same module in 2e */
      '5ed46911-a4b7-4944-b746-f224f5031db4': 'cb3e22a8-dfda-4ded-ab42-823c0ff96e1d',
      /* 5.1 Valence Bond Theory to the same module in 2e */
      '74586eeb-8131-4a48-b32a-d285cbfba707': '2b690768-dca5-4bbd-9780-22bc32852476',
      /* 5.4 Molecular Orbital Theory to the same module in 2e */
      '58805a0c-1013-44b7-837a-878cece9de6b': '4f90d5f4-c612-4a78-9240-635035f8433e',
      /* 6.1 Formula Mass and the Mole Concept to the same module in 2e */
      'd5516242-4416-4339-adc7-5a7461140d6d': 'daaceb82-341e-496e-a8b9-acd8fa32d9f7',
      /* 6.2 Determining Empirical and Molecular Formulas to the same module in 2e */
      '3c929abd-8cc0-4267-a017-a508815dac43': 'a4d0d6e1-b161-4cfd-ab54-23632839d0df',
      /* 8.3 Stoichiometry of Gaseous Substances, Mixtures, and Reactions to the same module in 2e */
      '184a65b2-1f3f-49dc-bf1d-7d4a12d21ae9': '15f67dd0-8548-4ac0-875f-f5cbf789ee94',
      /* 9.0 Introduction to the same module in 2e */
      'ee59d5c7-6a07-464c-9e56-b99ffdf874ea': 'cf0ef76c-34fd-4905-a755-a28d0e4a5d1a',
      /* 9.4 Strengths of Ionic and Covalent Bonds to the same module in 2e */
      '2b8e2876-209c-449d-9f2c-abbd73900c8b': 'd9a2a6fa-520e-4317-a0c5-56da7bece584',
      /* 12.4 Free Energy to the same module in 2e */
      '48d01599-d83d-494a-9d7f-b64e72f7d3e2': 'b1b4bf7c-8c27-4637-9fde-10b0ad5e9ad6',
      /* 13.0 Introduction to the same module in 2e */
      '4c2a35c8-ed8c-429c-9e49-25e0d3003bdc': '907ae180-6648-46e3-9f76-1c2f7919bbe4',
      /* 13.1 Chemical Equilibria to the same module in 2e */
      '5ba4be2f-b0d1-4b87-a65c-ddd234dda79e': '50ab1072-cc18-4529-96d7-87efc091087f',
      /* 13.2 Equilibrium Constants to the same module in 2e */
      '7ce6feca-8547-47b6-9b12-f4b32969da5b': '6fc48d99-000f-479e-9ea2-9527d41ffcb8',
      /* 13.3 Shifting Equilibria: La Châtelier's Principle to the same module in 2e */
      '023b68f9-1ea7-45cf-9911-25c1af3aa3ad': '7bc903b2-d341-4fc3-a205-02850547461e',
      /* 13.4 Equilibrium Calculations to the same module in 2e */
      '37feaf08-2a93-4dbe-84c4-140d213f9b5c': '353391e0-9913-4452-9f83-38f57233275a',
      /* 17.0 Introduction to the same module in 2e */
      '9d111d7d-7cb8-4688-9cd2-46774c477da9': 'b451b1e5-82ab-48c4-8275-37628dd79df7',
      /* 17.7 Catalysis to the same module in 2e */
      '40651eeb-28e7-4577-9bf7-d42282ec6ae5': 'a6400a57-a040-4768-8222-61705d4fff83',
    }],
  ],
  /* Química: Comenzando con los átomos 2ed */ '9702782f-fd50-4310-92ac-d29d39065419' : [
    /* Química 2ed */ ['462aa3f1-d65d-4cd9-a5ee-3214f95769b8', {
      /* Prefacio to the same module in 2ed */
      '541d7d79-a70e-42c2-b765-d55586648390': '138634ed-6ed0-4edb-b13d-b78d388028b0',
      /* 2.0 Introducción to the same module in 2ed */
      '1cb2b2cb-c17a-4cee-b972-13ebc03f7627': 'b49c3d38-7dfb-4979-ba45-12fdd44f2cc8',
      /* 2.1 Las primeras ideas de la teoría atómica to the same module in 2ed */
      'ebfab4d3-9644-41b8-80fc-a67ba47c0f57': '3c9c47d2-06f5-42b3-ba17-2248cc3dd7a9',
      /* 2.2 Evolución de la teoría atómica to the same module in 2ed */
      'c3dccc36-8ede-466f-b216-f05018a4e088': 'bd29edc8-a139-456b-bc95-cee49b2fa5b1',
      /* 2.3 Estructura atómica y simbolismo to the same module in 2ed */
      '77398b85-782d-4a36-b0a6-a0959dbf9c60': 'e82ac421-e027-4ba2-8c34-2b8bdde7f3dc',
      /* 2.4 Fórmulas químicas to the same module in 2ed */
      '594e5009-d70c-4101-ae18-4154ff1c7ffd': '9d7d0989-f579-4047-9023-8048341af5de',
      /* 3.0 Introducción to the same module in 2ed */
      'fc7f7fc6-4d9f-4956-a5a7-3092ac72182e': 'fc7f7fc6-4d9f-4956-a5a7-3092ac72182e',
      /* 3.1 Energía electromagnética to the same module in 2ed */
      'd96495d5-09fe-4702-959f-d39a243c2612': '41ea6265-62bd-4d5d-b62f-efc9dea99210',
      /* 3.6 La tabla periódica to the same module in 2ed */
      '4d73981f-76cf-43a3-b932-9f68fdf3abf6': '601be624-33cb-45bb-beb8-d069264fae07',
      /* 3.7 Compuestos iónicos y moleculares to the same module in 2ed */
      'b832199d-447d-4c4b-b05b-af31e4297fa6': 'f1c0d0db-2d56-4a2f-b6cb-2bf649278669',
      /* 4.1 Enlace iónico to the same module in 2ed */
      '15fcaa15-d7e8-4c4b-a448-20ea312b13ff': '30abf24f-5db5-4f44-b275-62908b3f1f4b',
      /* 4.3 Nomenclatura química to the same module in 2e */
      'af022e7e-64ba-4771-aca4-0cde75b66925': 'dc382342-b6fe-42b8-9f76-4acc4d8246ce',
      /* 5.0 Introducción to the same module in 2ed */
      '5ed46911-a4b7-4944-b746-f224f5031db4': 'cb3e22a8-dfda-4ded-ab42-823c0ff96e1d',
      /* 5.1 Teoría de enlace de valencia to the same module in 2ed */
      '74586eeb-8131-4a48-b32a-d285cbfba707': '2b690768-dca5-4bbd-9780-22bc32852476',
      /* 5.4 Teoría de los orbitales moleculares to the same module in 2ed */
      '58805a0c-1013-44b7-837a-878cece9de6b': '4f90d5f4-c612-4a78-9240-635035f8433e',
      /* 6.1 Fórmula de masa to the same module in 2ed */
      'd5516242-4416-4339-adc7-5a7461140d6d': 'daaceb82-341e-496e-a8b9-acd8fa32d9f7',
      /* 6.2 Determinación de fórmulas empíricas y moleculares to the same module in 2ed */
      '3c929abd-8cc0-4267-a017-a508815dac43': 'a4d0d6e1-b161-4cfd-ab54-23632839d0df',
      /* 8.3 Estequiometría de sustancias gaseosas, mezclas y reacciones to the same module in 2ed */
      '184a65b2-1f3f-49dc-bf1d-7d4a12d21ae9': '15f67dd0-8548-4ac0-875f-f5cbf789ee94',
      /* 9.0 Introducción to the same module in 2ed */
      'ee59d5c7-6a07-464c-9e56-b99ffdf874ea': 'cf0ef76c-34fd-4905-a755-a28d0e4a5d1a',
      /* 9.4 Fuerza de los enlaces iónicos y covalentes to the same module in 2ed */
      '2b8e2876-209c-449d-9f2c-abbd73900c8b': 'd9a2a6fa-520e-4317-a0c5-56da7bece584',
      /* 12.4 Energía libre to the same module in 2ed */
      '48d01599-d83d-494a-9d7f-b64e72f7d3e2': 'b1b4bf7c-8c27-4637-9fde-10b0ad5e9ad6',
      /* 13.0 Introducción to the same module in 2ed */
      '4c2a35c8-ed8c-429c-9e49-25e0d3003bdc': '907ae180-6648-46e3-9f76-1c2f7919bbe4',
      /* 13.1 Equilibrio químico to the same module in 2ed */
      '5ba4be2f-b0d1-4b87-a65c-ddd234dda79e': '50ab1072-cc18-4529-96d7-87efc091087f',
      /* 13.2 Constantes de equilibrio to the same module in 2ed */
      '7ce6feca-8547-47b6-9b12-f4b32969da5b': '6fc48d99-000f-479e-9ea2-9527d41ffcb8',
      /* 13.3 Equilibrios cambiantes: el principio de Le Châtelier to the same module in 2ed */
      '023b68f9-1ea7-45cf-9911-25c1af3aa3ad': '7bc903b2-d341-4fc3-a205-02850547461e',
      /* 13.4 Cálculos de equilibrio to the same module in 2ed */
      '37feaf08-2a93-4dbe-84c4-140d213f9b5c': '353391e0-9913-4452-9f83-38f57233275a',
      /* 17.0 Introducción to the same module in 2ed */
      '9d111d7d-7cb8-4688-9cd2-46774c477da9': 'b451b1e5-82ab-48c4-8275-37628dd79df7',
      /* 17.7 Catálisis to the same module in 2ed */
      '40651eeb-28e7-4577-9bf7-d42282ec6ae5': 'a6400a57-a040-4768-8222-61705d4fff83',
    }],
  ],
  /* Precalculus 2e */ 'f021395f-fd63-46cd-ab95-037c6f051730' : [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
  ],
  /* Precalculus */ 'fd53eae1-fa23-47c7-bb1b-972349835c3c' : [
    /* College Algebra 2e */ ['35d7cce2-48dd-4403-b6a5-e828cb5a17da', {}],
    /* Precalculus 2e */ ['f021395f-fd63-46cd-ab95-037c6f051730', {}],
  ],
  /* College Physics */ '031da8d3-b525-429c-80cf-6c8ed997733a': [
    /* College Physics 2e */ ['a31df062-930a-4f46-8953-605711e6d204', {}],
  ],
  /* Principles of Accounting Vol. 2 */ '920d1c8a-606c-4888-bfd4-d1ee27ce1795': [
    /* Principles of Accounting Vol. 1 */ ['9ab4ba6d-1e48-486d-a2de-38ae1617ca84', {}],
  ],
  /* University Physics Vol. 2 */ '7a0f9770-1c44-4acd-9920-1cd9a99f2a1e': [
    /* University Physics Vol. 1 */ ['d50f6e32-0fda-46ef-a362-9bd36ca7c97d', {}],
  ],
  /* University Physics Vol. 3 */ 'af275420-6050-4707-995c-57b9cc13c358': [
    /* University Physics Vol. 1 */ ['d50f6e32-0fda-46ef-a362-9bd36ca7c97d', {}],
  ],
  /* Física Universitaria volumen 2 */ 'da02605d-6d69-447c-a9b9-caf06dc4f413': [
    /* Física universitaria volumen 1 */ ['175c88b6-f89b-4eba-9514-bc45e2139a1d', {}],
  ],
  /* Física universitaria volumen 3 */ 'b647a9b9-7631-45a1-a8e7-5acc3a44fc01': [
    /* Física universitaria volumen 1 */ ['175c88b6-f89b-4eba-9514-bc45e2139a1d', {}],
  ],
  /* Fizyka dla szkół wyższych. Tom 2 */ '16ab5b96-4598-45f9-993c-b8d78d82b0c6': [
    /* Fizyka dla szkół wyższych. Tom 1 */['4eaa8f03-88a8-485a-a777-dd3602f6c13e', {}],
  ],
  /* Fizyka dla szkół wyższych. Tom 3 */ 'bb62933e-f20a-4ffc-90aa-97b36c296c3e': [
    /* Fizyka dla szkół wyższych. Tom 1 */['4eaa8f03-88a8-485a-a777-dd3602f6c13e', {}],
  ],
  /* Calculus Vol. 2 */ '1d39a348-071f-4537-85b6-c98912458c3c': [
    /* Calculus Vol. 1 */ ['8b89d172-2927-466f-8661-01abc7ccdba4', {}],
  ],
  /* Calculus Vol. 3 */ 'a31cd793-2162-4e9e-acb5-6e6bbd76a5fa': [
    /* Calculus Vol. 1 */ ['8b89d172-2927-466f-8661-01abc7ccdba4', {}],
    /* Calculus Vol. 2 */ ['1d39a348-071f-4537-85b6-c98912458c3c', {}],
  ],
  /* Cálculo Vol. 2 */ '8079f22f-c0a0-43ed-bb35-871d8d9743f3': [
    /* Cálculo Vol. 1 */ ['8635f0be-e734-4cd1-a10e-8063e5b863b6', {}],
  ],
  /* Cálculo Vol. 3 */ '21b1d0df-a716-4205-8e86-0d0787b2c991': [
    /* Cálculo Vol. 1 */ ['8635f0be-e734-4cd1-a10e-8063e5b863b6', {}],
    /* Cálculo Vol. 2 */ ['8079f22f-c0a0-43ed-bb35-871d8d9743f3', {}],
  ],
  /* World History Vol. 2 */ '685e3163-1032-4529-bb3a-f97a54412704': [
    /* World History Vol. 1 */ ['685e3163-1032-4529-bb3a-f97a54407214', {}],
  ],
};

export type CanonicalBookMap = ObjectLiteral<Array<[string, ObjectLiteral<string | undefined>]> | undefined>;

export interface ObjectLiteral<V> {
  [key: string]: V;
}
