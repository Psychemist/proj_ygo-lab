-- Create database
CREATE DATABASE ygo_lab;
--
-- Create Tables
CREATE TABLE card_types(
    id SERIAL primary key,
    type text not null
);
CREATE TABLE users (
    id SERIAL primary key,
    username text not null,
    password text not null,
    cash integer not null default 5000,
    isActive boolean not null default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
CREATE TABLE cards (
    id SERIAL primary key,
    name text not null,
    power integer,
    type_id integer,
    FOREIGN KEY (type_id) REFERENCES card_types(id),
    image text not null,
    normal_price integer not null
);
CREATE TABLE user_cards (
    id SERIAL primary key,
    card_id integer,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    quantity integer not null,
    user_id integer,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE marketplace(
    id SERIAL primary key,
    card_id integer,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    user_id integer,
    FOREIGN KEY (user_id) REFERENCES users(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
CREATE TABLE marketplace_on_sales(
    id SERIAL primary key,
    card_id integer,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    on_sales_price integer not null,
    isInStock boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
CREATE TABLE user_decks(
    id SERIAL primary key,
    user_id integer,
    FOREIGN KEY (user_id) REFERENCES users(id),
    deck_name text not null
);
CREATE TABLE user_deck_cards(
    id SERIAL primary key,
    user_deck_id integer,
    FOREIGN KEY (user_deck_id) REFERENCES user_decks(id),
    user_card_id integer,
    FOREIGN KEY (user_card_id) REFERENCES user_cards(id),
    card_in_deck_quantity integer not null
);
-- 
-- 
-- 
-- 
-- Insert Users
INSERT INTO users (username, password)
VALUES ('player1', '111111');
INSERT INTO users (username, password)
VALUES ('player2', '222222');
INSERT INTO users (username, password)
VALUES ('player3', '333333');
INSERT INTO users (username, password)
VALUES ('player4', '444444');
INSERT INTO users (username, password)
VALUES ('player5', '555555');
INSERT INTO users (username, password)
VALUES ('player6', '666666');
INSERT INTO users (username, password)
VALUES ('player7', '777777');
INSERT INTO users (username, password)
VALUES ('player8', '888888');
INSERT INTO users (username, password)
VALUES ('player9', '999999');
INSERT INTO users (username, password)
VALUES ('player10', '101010');
INSERT INTO users (username, password)
VALUES ('mike', 'mike');
--
--
--
--
--Insert card types
INSERT INTO card_types (type)
VALUES ('monster_card');
INSERT INTO card_types (type)
VALUES ('magic_card');
INSERT INTO card_types (type)
VALUES ('trap_card');
-- 
-- 
-- 
-- 
-- Insert Monster Cards
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster1',
        1700,
        1,
        'monster1.jpg',
        170
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster2',
        1300,
        1,
        'monster2.jpg',
        130
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster3',
        1500,
        1,
        'monster3.jpg',
        150
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster4',
        3000,
        1,
        'monster4.jpg',
        300
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster5',
        2800,
        1,
        'monster5.jpg',
        280
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster6',
        1700,
        1,
        'monster6.jpg',
        170
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster7',
        2200,
        1,
        'monster7.jpg',
        220
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster8',
        1800,
        1,
        'monster8.jpg',
        180
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster9',
        4000,
        1,
        'monster9.jpg',
        2000
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster10',
        2100,
        1,
        'monster10.jpg',
        210
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster11',
        1600,
        1,
        'monster11.jpg',
        160
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster12',
        3500,
        1,
        'monster12.jpg',
        350
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster13',
        1100,
        1,
        'monster13.jpg',
        110
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster14',
        1500,
        1,
        'monster14.jpg',
        150
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster15',
        2000,
        1,
        'monster15.jpg',
        200
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster16',
        1700,
        1,
        'monster16.jpg',
        170
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster17',
        1400,
        1,
        'monster17.jpg',
        140
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster18',
        1700,
        1,
        'monster18.jpg',
        170
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster19',
        2500,
        1,
        'monster19.jpg',
        2200
    );
INSERT INTO cards (name, power, type_id, image, normal_price)
VALUES (
        'monster20',
        1800,
        1,
        'monster20.jpg',
        180
    );
-- Insert 4 rare cards 
-- INSERT INTO cards (name, power, type_id, image, normal_price)
-- VALUES (
--         'monster21',
--         4500,
--         1,
--         'monsterR1.jpg',
--         3300,
--     );
-- INSERT INTO cards (name, power, type_id, image, normal_price)
-- VALUES (
--         'monster22',
--         3200,
--         1,
--         'monsterR2.jpg',
--         2800,
--     );
-- INSERT INTO cards (name, power, type_id, image, normal_price)
-- VALUES (
--         'monster23',
--         2000,
--         1,
--         'monsterR3.jpg',
--         2000,
--     );
-- INSERT INTO cards (name, power, type_id, image, normal_price)
-- VALUES (
--         'monster24',
--         4500,
--         1,
--         'monsterR4.jpg',
--         3600,
--     );
-- 
-- 
-- 
-- 
-- Insert Magic Cards
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('heal600', 2, 'spell1.jpg', 300);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('heal1000', 2, 'spell2.jpg', 500);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('suck500', 2, 'spell3.jpg', 100);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('hurt300', 2, 'spell4.jpg', 150);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('powerGain700', 2, 'spell5.jpg', 500);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('draw2', 2, 'spell6.jpg', 600);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('coinDraw', 2, 'spell7.jpg', 450);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('doubleSummon', 2, 'spell8.jpg', 600);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES (
        'destroyAllOppoMons',
        2,
        'spell9.jpg',
        800
    );
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('backToDeck', 2, 'spell10.jpg', 600);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell11', 2, 'spell11.jpg', 300);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell12', 2, 'spell12.jpg', 650);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell13', 2, 'spell13.jpg', 500);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell14', 2, 'spell14.jpg', 300);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell15', 2, 'spell15.jpg', 450);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell16', 2, 'spell16.jpg', 400);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell17', 2, 'spell17.jpg', 500);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell18', 2, 'spell18.jpg', 700);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell19', 2, 'spell19.jpg', 750);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('spell20', 2, 'spell20.jpg', 600);
--
-- 
-- 
-- 
-- Insert Trap Cards
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('powerGain400', 3, 'trap1.jpg', 400);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('powerGain700', 3, 'trap2.jpg', 700);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('powerLost500', 3, 'trap3.jpg', 500);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('powerLost700', 3, 'trap4.jpg', 700);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('powerLostHalf', 3, 'trap5.jpg', 800);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('copyMonster', 3, 'trap6.jpg', 800);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('healFromAttack', 3, 'trap7.jpg', 900);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('destroyAllMons', 3, 'trap8.jpg', 1000);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES (
        'destroyAllOppoMons',
        3,
        'trap9.jpg',
        1100
    );
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('oppoNoAttack', 3, 'trap10.jpg', 300);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap11', 3, 'trap11.jpg', 500);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap12', 3, 'trap12.jpg', 600);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap13', 3, 'trap13.jpg', 750);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap14', 3, 'trap14.jpg', 600);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap15', 3, 'trap15.jpg', 800);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap16', 3, 'trap16.jpg', 700);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap17', 3, 'trap17.jpg', 650);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap18', 3, 'trap18.jpg', 750);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap19', 3, 'trap19.jpg', 800);
INSERT INTO cards (name, type_id, image, normal_price)
VALUES ('trap20', 3, 'trap20.jpg', 900);
--
-- 
-- 
-- 
-- Insert cards owned by users
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (1, 1, 1);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (2, 3, 2);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (3, 1, 3);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (4, 3, 4);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (5, 2, 5);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (6, 1, 6);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (7, 1, 7);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (8, 2, 8);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (9, 1, 9);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (10, 2, 10);
--
-- Insert cards in "marketplace" (Different users see different cards at the store)
INSERT INTO marketplace (card_id, user_id)
VALUES (1, 1),
    (2, 1),
    (3, 1),
    (4, 1),
    (5, 1),
    (6, 1),
    (7, 1),
    (8, 1),
    (9, 1),
    (10, 1);
INSERT INTO marketplace (card_id, user_id)
VALUES (2, 2);
INSERT INTO marketplace (card_id, user_id)
VALUES (3, 3);
INSERT INTO marketplace (card_id, user_id)
VALUES (4, 4);
INSERT INTO marketplace (card_id, user_id)
VALUES (5, 5);
INSERT INTO marketplace (card_id, user_id)
VALUES (6, 6);
INSERT INTO marketplace (card_id, user_id)
VALUES (7, 7);
INSERT INTO marketplace (card_id, user_id)
VALUES (8, 8);
INSERT INTO marketplace (card_id, user_id)
VALUES (9, 9);
INSERT INTO marketplace (card_id, user_id)
VALUES (10, 10);
--
--Insert cards in "marketplace_on_sales" (All users see the same 4 cards at the store)
INSERT INTO marketplace_on_sales (card_id, on_sales_price)
VALUES (9, 800);
INSERT INTO marketplace_on_sales (card_id, on_sales_price)
VALUES (19, 850);
INSERT INTO marketplace_on_sales (card_id, on_sales_price)
VALUES (26, 220);
INSERT INTO marketplace_on_sales (card_id, on_sales_price)
VALUES (29, 350);
INSERT INTO marketplace_on_sales (card_id, on_sales_price)
VALUES (48, 450);
INSERT INTO marketplace_on_sales (card_id, on_sales_price)
VALUES (49, 510);
-- INSERT INTO marketplace_on_sales (card_id, on_sales_price)
-- VALUES (22, 130);
-- INSERT INTO marketplace_on_sales (card_id, on_sales_price)
-- VALUES (38, 275);
-- INSERT INTO marketplace_on_sales (card_id, on_sales_price)
-- VALUES (42, 320);
-- INSERT INTO marketplace_on_sales (card_id, on_sales_price)
-- VALUES (45, 380);
-- INSERT INTO marketplace_on_sales (card_id, on_sales_price)
-- VALUES (60, 430);
--
--
--
--Insert user decks
INSERT INTO user_decks (user_id, deck_name)
VALUES (1, 'trialDeck4');
INSERT INTO user_decks (user_id, deck_name)
VALUES (2, 'trialDeck5');
INSERT INTO user_decks (user_id, deck_name)
VALUES (3, 'trialDeck6');
--
--
--
--Insert user's card
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (1, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (2, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (3, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (11, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (12, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (13, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (14, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (21, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (22, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (23, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (24, 3, 11);
INSERT INTO user_cards (card_id, quantity, user_id)
VALUES (25, 3, 11);
--
--
--Insert user deck cards
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 1, 10);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 2, 15);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 3, 0);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 11, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 12, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 13, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 14, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 15, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 16, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 17, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 18, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 19, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 20, 2);
INSERT INTO user_deck_cards (
        user_deck_id,
        user_card_id,
        card_in_deck_quantity
    )
VALUES (1, 21, 2);
--
--
--
-- Insert another deck
-- INSERT INTO user_deck_cards (
--         user_deck_id,
--         user_card_id,
--         card_in_deck_quantity
--     )
-- VALUES (24, 12, 2);
-- INSERT INTO user_deck_cards (
--         user_deck_id,
--         user_card_id,
--         card_in_deck_quantity
--     )
-- VALUES (24, 13, 1);
-- INSERT INTO user_deck_cards (
--         user_deck_id,
--         user_card_id,
--         card_in_deck_quantity
--     )
-- VALUES (24, 14, 2);
-- INSERT INTO user_deck_cards (
--         user_deck_id,
--         user_card_id,
--         card_in_deck_quantity
--     )
-- VALUES (24, 20, 1);
--
--
--
-- -- Update user decks
-- UPDATE user_decks
-- SET deck_name = 'mikeDeck1'
-- WHERE user_id = 11;
-- --
-- --
-- --
-- -- Selecting cards of mike
-- select cards.name,
--     cards.type_id,
--     cards.image,
--     user_cards.id,
--     user_cards.card_id,
--     user_cards.quantity,
--     user_cards.user_id,
--     user_deck_cards.id,
--     user_deck_cards.user_deck_id,
--     user_deck_cards.card_in_deck_quantity,
--     user_decks.deck_name
-- from cards
--     full join user_cards on cards.id = user_cards.card_id
--     full join user_deck_cards on user_cards.id = user_deck_cards.user_card_id
--     full join user_decks on user_deck_cards.user_deck_id = user_decks.id
--     full join users on user_decks.user_id = users.id
-- where user_cards.user_id = 11;